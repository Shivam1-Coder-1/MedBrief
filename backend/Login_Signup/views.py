from .models import Profile, Status, PasswordResetOTP
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, logout
from django.shortcuts import redirect
from django.core.validators import validate_email
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import random, hashlib, json, logging
from .Services import func_workout, diet_by_bmi
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import validate_email


logger = logging.getLogger(__name__)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

@api_view(["POST"])
@permission_classes([AllowAny])
def Signup(request):
    try:
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")
        if not username or not email or not password:
            return Response({"success": False, "msg": "All fields required"}, status=status.HTTP_400_BAD_REQUEST)
        validate_email(email)
        if User.objects.filter(username=username).exists():
            return Response({"success": False, "msg": "Username exists"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"success": False, "msg": "Email exists"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, email=email, password=password)
        Profile.objects.create(user=user)
        Status.objects.create(user=user)
        return Response({
            "success": True,
            "tokens": get_tokens_for_user(user),
            "user": {
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)
    except ValidationError:
        return Response({"success": False, "msg": "Invalid email format"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({"success": False, "msg": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([AllowAny])
def Login(request):
    try:
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")
        user = authenticate(username=username, password=password)
        if not user:
            return Response({"success": False, "msg": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        status_obj, _ = Status.objects.get_or_create(user=user)
        return Response({
            "success": True,
            "tokens": get_tokens_for_user(user),
            "user": {
                "username": user.username,
                "email": user.email,
                "profile_completed": status_obj.profile_completed
            }
        })
    except Exception:
        return Response({"success": False, "msg": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    try:
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"success": True})
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"success": True})
        PasswordResetOTP.objects.filter(user=user).delete()
        raw_otp = str(random.randint(100000, 999999))
        hashed_otp = hashlib.sha256(raw_otp.encode()).hexdigest()
        PasswordResetOTP.objects.create(user=user, otp=hashed_otp)
        send_mail("Password Reset OTP", f"Your OTP is {raw_otp}", None, [email], fail_silently=True)
        return Response({"success": True})
    except Exception:
        return Response({"success": True})

@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    try:
        email = request.data.get("email", "").strip()
        otp = request.data.get("otp", "")
        new_password = request.data.get("new_password", "")
        user = User.objects.get(email=email)
        otp_obj = PasswordResetOTP.objects.filter(user=user).latest("created_at")
        if otp_obj.is_expired():
            otp_obj.delete()
            return Response({"success": False, "msg": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)
        if otp_obj.attempts >= 3:
            otp_obj.delete()
            return Response({"success": False, "msg": "Too many attempts"}, status=status.HTTP_400_BAD_REQUEST)
        if hashlib.sha256(otp.encode()).hexdigest() != otp_obj.otp:
            otp_obj.attempts += 1
            otp_obj.save()
            return Response({"success": False, "msg": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        otp_obj.delete()
        return Response({"success": True, "msg": "Password reset done"})
    except Exception:
        return Response({"success": False, "msg": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def Profile_creation(request):
    try:
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.name = request.data.get("name")
        age = request.data.get("age")
        profile.age = int(age) if age else None
        profile.gender = request.data.get("gender")
        weight = request.data.get("weight")
        height = request.data.get("height")
        profile.weight = float(weight) if weight else None
        profile.height = float(height) if height else None
        profile.bloodgroup = request.data.get("bloodgroup")
        profile.allergies = request.data.get("allergies")
        profile.save()
        status_obj, _ = Status.objects.get_or_create(user=request.user)
        status_obj.profile_completed = True
        status_obj.save()
        return Response({"success": True, "msg": "Profile created successfully", "profile_completed": True})
    except ValueError as e:
        logger.error(f"Invalid data type: {str(e)}")
        return Response({"success": False, "msg": "Invalid weight or height format"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Profile creation error: {str(e)}")
        return Response({"success": False, "msg": "Failed to create profile"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def Send_Profile(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    return Response({
        "success": True,
        "username": request.user.username,
        "email": request.user.email,
        "name": profile.name,
        "age": profile.age,
        "gender": profile.gender,
        "weight": profile.weight,
        "height": profile.height,
        "bloodgroup": profile.bloodgroup,
        "allergies": profile.allergies
    })

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def Status_view(request):
    status_obj, _ = Status.objects.get_or_create(user=request.user)
    if request.method == "POST":
        value = request.data.get("profile_completed")
        if value is None:
            return Response({"success": False, "msg": "profile_completed required"}, status=status.HTTP_400_BAD_REQUEST)
        status_obj.profile_completed = bool(value)
        status_obj.save()
        return Response({"success": True, "profile_completed": status_obj.profile_completed})
    return Response({"success": True, "profile_completed": status_obj.profile_completed})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def Smart_Help(request):
    print("USER:", request.user)
    print("DATA:", request.data)

    know = request.data.get("know")

    logger.info(f"Incoming request - know: {know}, data: {request.data}")

    try:
        if know == "workout":
            level = request.data.get("workout_level")
            exercise_type = request.data.get("exercise_type")

            if not level:
                return Response(
                    {"success": False, "msg": "workout_level is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            result = func_workout(level, exercise_type)

        elif know == "diet":
            bmi = request.data.get("bmi")

            if bmi in [None, ""]:
                return Response(
                    {"success": False, "msg": "BMI is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            result = diet_by_bmi(float(bmi))

        else:
            return Response(
                {"success": False, "msg": "Invalid service category"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not result.get("success"):
            return Response(result, status=status.HTTP_502_BAD_GATEWAY)

        return Response(
            {"success": True, "type": know, "data": result.get("data")},
            status=status.HTTP_200_OK
        )

    except (ValueError, TypeError):
        return Response(
            {"success": False, "msg": "Invalid input type"},
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        logger.critical(f"UNHANDLED VIEW ERROR: {str(e)}")
        return Response(
            {"success": False, "msg": "Internal Server Error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )





from rest_framework_simplejwt.tokens import RefreshToken

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh_token")
        
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({"success": True, "msg": "Logged out successfully"})
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response(
            {"success": False, "msg": "Logout failed"},
            status=status.HTTP_400_BAD_REQUEST
        )