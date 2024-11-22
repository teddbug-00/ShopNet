from django.shortcuts import render

def home(request):
    return render(request, 'home.html')  # Create this template

def login_view(request):
    return render(request, 'auth/login.html')

def signup_view(request):
    return render(request, 'auth/signup.html')

def profile_view(request):
    return render(request, 'profile.html')

# Create your views here.