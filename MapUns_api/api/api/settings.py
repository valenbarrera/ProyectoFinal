import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from .env located at BASE_DIR
load_dotenv(os.path.join(BASE_DIR, '.env'))


SECRET_KEY = 'klcyvu4opz%^3$z3yf+0@a2a%o6ivuw8%n&t$i_kx2=n8d))jz'

DEBUG = True

#HOST_IP = '69.28.93.194:82'
HOST_IP = 'localhost'

ALLOWED_HOSTS = [
    "69.28.93.194",
    '127.0.0.1', 'localhost'
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',    
    'rest_framework',
    'rest_framework.authtoken',
    'users',
    'main',
    'Locaciones',
    'Alumnos',
    'Datos_domicilio',
    'Datos_familiares',
    'Datos_ocupacionales',
]


REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    )
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR,os.path.join(BASE_DIR,'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'api.wsgi.application'


DATABASES = {
    # DB en PostgreSQL, valores desde variables de entorno
    'default': {
         'ENGINE': 'django.db.backends.postgresql_psycopg2',
         'NAME': os.getenv('DB_NAME', 'mapauns'),
         'USER': os.getenv('DB_USER', 'postgres'),
         'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
         'HOST': os.getenv('DB_HOST', 'localhost'),
         'PORT': os.getenv('DB_PORT', '5432'),
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'America/Argentina/Buenos_Aires'

USE_I18N = True

USE_L10N = True

USE_TZ = False


STATIC_URL = '/static/'

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)

CORS_ORIGIN_ALLOW_ALL = True  

CORS_ALLOW_HEADERS = (
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
)
