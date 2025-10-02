import React from 'react';
import FilterModal from './FilterModal';

const ColumnFilter = ({ 
    column, 
    currentFilters, 
    isModalOpen, 
    otherFilters,
    openFilterModal,
    closeFilterModal,
    applyColumnFilter,
    clearColumnFilter,
    requestColumnValues 
}) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
                onClick={() => openFilterModal(column.accessor)}
                style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: currentFilters.length > 0 ? '2px solid #007bff' : '1px solid #ddd',
                    backgroundColor: currentFilters.length > 0 ? '#f0f8ff' : 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <span>
                    {currentFilters.length === 0 
                        ? '🔍 Filtrar' 
                        : `✓ ${currentFilters.length} filtros`
                    }
                </span>
                <span style={{ fontSize: '10px' }}>⚙️</span>
            </button>
            
            {/* Botón para borrar filtros */}
            {currentFilters.length > 0 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        clearColumnFilter(column.accessor);
                    }}
                    style={{
                        marginLeft: '5px',
                        padding: '6px',
                        border: '1px solid #dc3545',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        lineHeight: '1',
                    }}
                    title="Borrar filtro"
                >
                    ✕
                </button>
            )}
            
            <FilterModal
                isOpen={isModalOpen}
                onClose={() => closeFilterModal(column.accessor)}
                column={column}
                currentFilters={currentFilters}
                otherFilters={otherFilters}
                onApply={(values) => applyColumnFilter(column.accessor, values)}
                requestColumnValues={requestColumnValues}
            />
        </div>
    );
};

export default ColumnFilter;