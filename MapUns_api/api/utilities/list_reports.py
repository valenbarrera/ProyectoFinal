from django.shortcuts import render

from django.http import HttpResponse

from io import BytesIO

import xlwt

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfbase.ttfonts import TTFont

from reportlab.pdfgen import canvas

from reportlab.platypus import Table
from reportlab.platypus import SimpleDocTemplate, Paragraph, TableStyle

from utilities import list_utils

def _extract_header_name(header):
    if isinstance(header, str):
        return header

    if isinstance(header, dict):
        props = header.get('props') if isinstance(header.get('props'), dict) else None
        if props and 'children' in props:
            children = props.get('children')
            if isinstance(children, list):
                return ''.join([c if isinstance(c, str) else str(c) for c in children])
            return str(children)
        t = header.get('type')
        return str(t) if t is not None else 'Columna'
    return str(header)

def fl_scale(fl_value):
    return int(fl_value * 0.36)

fl_width = fl_scale(1653)
fl_height = fl_scale(2338)
int_margin_left = fl_scale(50)
int_margin_right = fl_scale(50)


def file_default_export(db_query, str_nombre, obj_data):
    mode = obj_data['mode']
    int_table_page_size = obj_data['table']['pageSize']
    int_table_page = obj_data['table']['page']
    ar_table_sorted = obj_data['table']['sorted']
    ar_table_filtered = obj_data['table']['filtered']

    ar_tmpcolumns = []
    for column in obj_data['columns']:
        if column.get('show'):
            header_text = _extract_header_name(column.get('Header'))
            ar_tmpcolumns.append({
                **column,
                'Header': header_text,
            })

    obj_data['columns'] = ar_tmpcolumns

    ar_columns = [
        {
            'id': column['id'],
            'width': column.get('width', None),
            'name': column.get('Header')
        }
        for column in obj_data['columns']
    ]

    ar_column_names = [column['id'] for column in obj_data['columns']]

    ar_lista = []
    if mode == 1:
        ar_lista = list_utils.obj_filtered_list(db_query, int_table_page_size, int_table_page, ar_column_names, ar_table_filtered, ar_table_sorted, True)
    if mode == 2:
        ar_lista = list_utils.obj_filtered_list(db_query, int_table_page_size, int_table_page, ar_column_names, ar_table_filtered, ar_table_sorted, False)
    if mode == 3:
        ar_lista = {'list': list(db_query.values(*ar_column_names))}

    if obj_data['format'] == 1:
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'inline;filename="' + str_nombre + '.pdf"'
        return pdf_generate(response, str_nombre, ar_lista, ar_columns, obj_data['landscape'])
    elif obj_data['format'] == 2:
        response = HttpResponse(content_type='application/ms-excel')
        response['Content-Disposition'] = 'attachment; filename="' + str_nombre + '.xls"'
        return excel_generate(response, str_nombre, ar_lista, ar_columns)

def pdf_generate(response, str_nombre, ar_lista, ar_columns, bln_landscap):
    b_buff = BytesIO()

    doc = SimpleDocTemplate(b_buff, pagesize = A4, rightMargin = 10, leftMargin = 10, topMargin = 10, bottomMargin = 18)
    if bln_landscap:
        b_buff = BytesIO()
        doc = SimpleDocTemplate(b_buff, pagesize = landscape(A4), rightMargin = 10, leftMargin = 10, topMargin = 10, bottomMargin = 18)

    fl_width = doc.width
    fl_height = doc.height

    ar_builder = []
    styles = getSampleStyleSheet()
    header = Paragraph(str_nombre, styles['Heading1'])
    ar_builder.append(header)
    
    ar_column_names = [obj_column['name'] for obj_column in ar_columns]
    ar_column_ids = [obj_column['id'] for obj_column in ar_columns]

    int_efficient_width = fl_width - int_margin_left - int_margin_right
    
    int_total_width = 0
    for obj_column in ar_columns:
        if obj_column['width']:
            int_total_width += obj_column['width']
        else:
            obj_column['width'] = 100
            int_total_width += obj_column['width']

    ar_column_width = []
    for obj_column in ar_columns:
        ar_column_width.append(obj_column['width'] * int_efficient_width / int_total_width)

    ar_lista = ar_lista['list']

    t = Table([ar_column_names] + list_utils.list_dict_to_list(ar_column_ids, ar_lista), colWidths=ar_column_width)
    t.setStyle(TableStyle(
        [
            ('GRID', (0, 0), (100, -1), 1, colors.gray), 
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.gray), 
            ('BACKGROUND', (0, 0), (-1, 0), colors.gray), 
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white), 
            ('FONTSIZE', (0, 0), (-1, 0), 12), 
            ('BOTTOMPADDING', (0, 0), (-1, 0), 5), 
        ]
    ))

    ar_builder.append(t)
    doc.build(ar_builder)
    response.write(b_buff.getvalue())
    b_buff.close()
    return response


def excel_generate(response, str_nombre, ar_lista, ar_columns):
    wb = xlwt.Workbook(encoding='utf-8')
    ws = wb.add_sheet(str_nombre)

    int_row_num = 0

    style_font = xlwt.XFStyle()
    style_font.font.bold = True

    for int_col_num in range(len(ar_columns)):
        ws.write(int_row_num, int_col_num, ar_columns[int_col_num]['name'], style_font)
        if ar_columns[int_col_num]['width']:
            ws.col(int_col_num).width = 30 * int(ar_columns[int_col_num]['width'])
        else:
            ws.col(int_col_num).width = 30 * 100

    style_font = xlwt.XFStyle()

    ar_column_ids = [obj_column['id'] for obj_column in ar_columns]
    

    ar_lista = ar_lista['list']
    list_rows =  list_utils.list_dict_to_list(ar_column_ids, ar_lista)
    for ar_row in list_rows:
        int_row_num += 1
        for int_col_num in range(len(ar_row)):
            ws.write(int_row_num, int_col_num, ar_row[int_col_num], style_font)

    wb.save(response)
    return response

def fl_gety(fl_y):
    return fl_height - fl_y
