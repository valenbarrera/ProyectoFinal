from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from django.http.response import JsonResponse

from utilities import list_utils
from .models import Transportes


@api_view(['GET'])
@authentication_classes((TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def Select(request):
    db_query = Transportes.objects.all().order_by("nombre")
    ar_reply = list_utils.obj_filtered_list(db_query, 1, 1, ["pk", "nombre"], [], [], False)["list"]
    return JsonResponse({"rows": ar_reply})
