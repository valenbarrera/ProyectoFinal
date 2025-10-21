import logging
from typing import Optional, Tuple

_logger = logging.getLogger(__name__)

try:  # pragma: no cover
    import requests  # type: ignore
except Exception:  # pragma: no cover
    requests = None  # type: ignore


_CACHE = {}


def _norm(s: Optional[str]) -> str:
    return (s or '').strip()


def _compose_address(street: Optional[str], number: Optional[str],
                     localidad: Optional[str], provincia: Optional[str],
                     country: str = 'Argentina') -> str:
    parts = []
    street = _norm(street)
    number = _norm(number)
    if street and number:
        parts.append(f"{street} {number}")
    elif street:
        parts.append(street)
    if _norm(localidad):
        parts.append(_norm(localidad))
    if _norm(provincia):
        parts.append(_norm(provincia))
    if country:
        parts.append(country)
    return ', '.join([p for p in parts if p])


def geocode_query(query: str) -> Optional[Tuple[float, float]]:
    q = _norm(query)
    if not q:
        return None
    if q in _CACHE:
        return _CACHE[q]

    if requests is None:
        _logger.warning("requests not available; skipping geocode for: %s", q)
        return None

    url = 'https://nominatim.openstreetmap.org/search'
    params = {
        'q': q,
        'format': 'json',
        'limit': 1,
        'addressdetails': 0,
    }
    headers = {
        'User-Agent': 'MapUns/1.0'
    }
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        if resp.status_code != 200:
            _logger.warning("Nominatim returned status %s for %s", resp.status_code, q)
            return None
        data = resp.json() or []
        if not data:
            _CACHE[q] = None
            return None
        item = data[0]
        try:
            lat = float(item.get('lat'))
            lon = float(item.get('lon'))
        except Exception:
            return None
        _CACHE[q] = (lat, lon)
        return _CACHE[q]
    except Exception as e:  # pragma: no cover
        _logger.error("Error geocoding '%s': %s", q, e)
        return None


def geocode_address(street: Optional[str], number: Optional[str],
                    localidad: Optional[str], provincia: Optional[str]) -> Optional[Tuple[float, float]]:
    query = _compose_address(street, number, localidad, provincia)
    return geocode_query(query)


def geocode_localidad(nombre: Optional[str], provincia: Optional[str]) -> Optional[Tuple[float, float]]:
    nombre = _norm(nombre)
    provincia = _norm(provincia)
    if not nombre:
        return None
    # Try with province and country context
    q1 = ', '.join([p for p in [nombre, provincia or None, 'Argentina'] if p])
    res = geocode_query(q1)
    if res:
        return res
    # Fallback to name only
    return geocode_query(nombre)

