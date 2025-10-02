from django.db.models import Q
import json
import math

from django.http.response import JsonResponse

# Actualización del método obj_filtered_list en list_utils.py:

def obj_filtered_list(db_query, int_page_size, int_page, ar_columns, ar_filters, ar_sorts, bln_limit=True, distinct=False):
    total = db_query.count()
    
    db_filters = None
    for obj_filter in ar_filters:
        if type(obj_filter['value']) is dict:
            str_field_filter = obj_filter['id'] + '__' + obj_filter['value']['lookup']
            if db_filters != None:
                db_filters = Q(db_filters & Q(**{str_field_filter: obj_filter['value']['input']}))
            else:
                db_filters = Q(**{str_field_filter: obj_filter['value']['input']})
        else:
            # Si el valor es lista → usamos __in
            if isinstance(obj_filter['value'], list):
                str_field_filter = obj_filter['id'] + "__in"
                q_obj = Q(**{str_field_filter: obj_filter['value']})
            # Si es un valor booleano (para campos como debaja)
            elif isinstance(obj_filter['value'], bool):
                str_field_filter = obj_filter['id']
                q_obj = Q(**{str_field_filter: obj_filter['value']})
            else:
                # Si es fecha → mayor a
                if 'fecha' in obj_filter['id']:
                    str_field_filter = obj_filter['id'] + "__gt"
                else:
                    str_field_filter = obj_filter['id'] + "__icontains"
                q_obj = Q(**{str_field_filter: obj_filter['value']})

            if db_filters is not None:
                db_filters &= q_obj
            else:
                db_filters = q_obj

    if db_filters != None:
        db_query = db_query.filter(db_filters)

    int_total_filtered = db_query.count()
    
    # Si se solicitan valores distintos, no aplicar paginación
    if distinct:
        # Para obtener valores únicos, usamos distinct() en la columna
        if len(ar_columns) == 1:
            db_query = db_query.values(ar_columns[0]).distinct().order_by(ar_columns[0])
        pages = 1
        int_total_show = db_query.count()
    else:
        pages = math.ceil(int_total_filtered / int_page_size) if int_page_size > 0 else 1
        
        start = int_page * int_page_size
        length = int_page_size * (int_page + 1)
        
        ar_order = []
        for s in ar_sorts:
            if s['desc']:
                ar_order.append("-" + s['id'])
            else:
                ar_order.append(s['id'])

        if len(ar_order) > 0:
            db_query = db_query.order_by(*ar_order)
        else:
            db_query = db_query.order_by("pk")

        if bln_limit and int_page_size > 0:
            db_query = db_query[start:length]

        int_total_show = db_query.count()

    return {
        'list': list(db_query.values(*ar_columns)),
        'pages': pages,
        'total': total,
        'totalFiltered': int_total_filtered,
        'totalShow': int_total_show
    }

def obj_tables_default(db_query, obj_data):
    int_page_size = obj_data['table']['pageSize']
    int_page = obj_data['table']['page']
    ar_columns = obj_data['columns']
    ar_filters = obj_data['table']['filtered']
    ar_sorts = obj_data['table']['sorted']
    
    # Verificar si se solicitan valores distintos
    distinct = obj_data.get('distinct', False)
    
    # Si pageSize es -1, obtener todos los registros
    bln_limit = True
    if int_page_size == -1:
        bln_limit = False
        int_page_size = 999999  # Un número muy grande

    obj_reply = obj_filtered_list(db_query, int_page_size, int_page, ar_columns, ar_filters, ar_sorts, bln_limit, distinct)

    return JsonResponse({
        "rows": obj_reply['list'],
        "pages": obj_reply['pages'],
        "total": obj_reply['total'],
        "totalFiltered": obj_reply['totalFiltered'],
        "totalShow": obj_reply['totalShow']
    })


def list_dict_to_list(ar_columns, d):
    ar_array = []
    for elm in d:
        ar_sub_array = []
        for str_column in ar_columns:
            _value = elm.get(str_column)
            if(str(type(elm.get(str_column)))=="<class 'datetime.datetime'>"):
                _value = "{:%d/%m/%Y %H:%M}".format(_value)
            ar_sub_array.append(_value)
        ar_array.append(ar_sub_array)
    return ar_array