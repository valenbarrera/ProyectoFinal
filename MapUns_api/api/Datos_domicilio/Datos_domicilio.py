from django.http.response import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

from utilities import list_utils
from .models import Datos_domicilio


@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def List(request):
    obj_data = None
    try:
        import json
        obj_data = json.loads(request.GET.get('data')) if request.GET.get('data') else {}
    except Exception:
        obj_data = {}

    db_query = Datos_domicilio.objects.all().order_by('pk')
    return list_utils.obj_tables_default(db_query, obj_data)

