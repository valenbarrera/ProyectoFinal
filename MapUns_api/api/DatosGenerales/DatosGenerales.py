from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from django.http.response import JsonResponse

from utilities import list_utils # Assuming you have a similar utility file
from .models import DatosGenerales

@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Select(request):
    db_query = DatosGenerales.objects.all().order_by("fecha_actividad") 
    ar_reply = list_utils.obj_filtered_list(db_query, 1, 1, ["pk", "cliente", "fecha_actividad"], [], [], False)["list"]
    
    return JsonResponse({"rows": ar_reply})
