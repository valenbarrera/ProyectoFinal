import React from 'react';

// Componente FilterModal - CON FILTRADO EN CASCADA
const FilterModal = ({ isOpen, onClose, column, currentFilters, onApply, requestColumnValues, otherFilters }) => {
    if (!isOpen) return null;

    const [uniqueValues, setUniqueValues] = React.useState([]);
    const [selectedValues, setSelectedValues] = React.useState(currentFilters || []);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (isOpen && requestColumnValues) {
            setLoading(true);
            requestColumnValues(column.accessor, otherFilters)
                .then(response => {
                    const values = response.rows
                        .map(row => row[column.accessor])
                        .filter((val, i, self) => val !== null && val !== undefined && val !== '' && self.indexOf(val) === i)
                        .sort();
                    setUniqueValues(values);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error al cargar valores de columna:', error);
                    setLoading(false);
                });
        }
    }, [isOpen, column.accessor, requestColumnValues, otherFilters]);

    React.useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 200);
        }
    }, [isOpen]);

    React.useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const filteredValues = uniqueValues.filter(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleValue = (value) => {
        setSelectedValues(prev => {
            if (prev.includes(value)) {
                return prev.filter(v => v !== value);
            } else {
                return [...prev, value];
            }
        });
    };

    const handleApply = () => {
        onApply(selectedValues);
        onClose();
    };

    const selectAll = () => {
        setSelectedValues(filteredValues);
    };

    const clearAll = () => {
        setSelectedValues([]);
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={handleBackdropClick}
        >
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                width: '400px',
                maxHeight: '500px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>
                        Filtrar por {column.Header}
                    </h3>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '0',
                            width: '24px',
                            height: '24px'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Info sobre filtrado en cascada */}
                {otherFilters && otherFilters.length > 0 && (
                    <div style={{
                        padding: '8px 16px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #eee',
                        fontSize: '12px',
                        color: '#666'
                    }}>
                        🔗 Valores filtrados por {otherFilters.length} filtro{otherFilters.length > 1 ? 's' : ''} activo{otherFilters.length > 1 ? 's' : ''}
                    </div>
                )}

                {/* Search */}
                <div style={{ padding: '16px' }}>
                    <input
                        type="text"
                        placeholder="Buscar opciones..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                        disabled={loading}
                        ref={inputRef}
                    />
                </div>

                {/* Actions */}
                <div style={{
                    padding: '0 16px',
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px'
                }}>
                    <button 
                        onClick={selectAll}
                        disabled={loading || filteredValues.length === 0}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #007bff',
                            backgroundColor: 'transparent',
                            color: '#007bff',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            opacity: loading ? 0.5 : 1
                        }}
                    >
                        Seleccionar todos
                    </button>
                    <button 
                        onClick={clearAll}
                        disabled={loading}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #dc3545',
                            backgroundColor: 'transparent',
                            color: '#dc3545',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            opacity: loading ? 0.5 : 1
                        }}
                    >
                        Limpiar todo
                    </button>
                </div>

                {/* Options List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    maxHeight: '250px',
                    margin: '0 16px'
                }}>
                    {loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#666'
                        }}>
                            Cargando opciones...
                        </div>
                    ) : (
                        <div>
                            {filteredValues.map(val => (
                                <div
                                    key={val}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        backgroundColor: selectedValues.includes(val) ? '#f0f8ff' : 'transparent',
                                        border: selectedValues.includes(val) ? '1px solid #007bff' : '1px solid transparent',
                                        marginBottom: '2px'
                                    }}
                                    onClick={() => toggleValue(val)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(val)}
                                        readOnly
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontSize: '14px' }}>{val}</span>
                                </div>
                            ))}
                            {filteredValues.length === 0 && !loading && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: '#666',
                                    fontStyle: 'italic'
                                }}>
                                    No se encontraron opciones
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                        {selectedValues.length} de {uniqueValues.length} seleccionados
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={onClose}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #ddd',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleApply}
                            disabled={loading}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                backgroundColor: loading ? '#ccc' : '#007bff',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Aplicar Filtro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;