import React, { Component } from 'react';
import axios from "axios";
import PropTypes from 'prop-types';

import auth from '../../auth/';

import ReactTable from "react-table";
import "react-table/react-table.css";

import "./UnsTable.scss";

import UnsTableHeader from "./UnsTableHeader.js"
import ColumnFilter from "../Filters/ColumnFilter";

var filterTimeout = null;
var columnsChangedTimeout = null;


class UnsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            pages: null,
            loading: true,
            selectedRows: [],
            selectedRow: null,
            firstLoad: true,
            tableState: null,
            columns: this.props.columns,
            tableColumns: this.props.columns,
            resizedColumns: null,
            total: 0,
            totalFiltered: 0,
            showing: 0,
            defaultConfig: {
                pageSize: (this.props.defaultPageSize ? this.props.defaultPageSize : 29),
            },
            selectAll: false,
            modalStates: {},
            debajaFilter: null,
            persistedFilters: (this.props.outerFilter ? this.props.outerFilter : []),
        };
        this.fetchData = this.fetchData.bind(this);
        this.requestColumnValues = this.requestColumnValues.bind(this);
    }

    static propTypes = {
        buttons: PropTypes.any,
        apiUrl: PropTypes.any.isRequired,
        columns: PropTypes.any.isRequired,
        exportUrl: PropTypes.any,
        title: PropTypes.string.isRequired,
        multiSelect: PropTypes.bool,
        outerFilter: PropTypes.array,
        outerSort: PropTypes.array,
        customSearchElement: PropTypes.any,
        defaultPageSize: PropTypes.number,
        selectAll: PropTypes.bool,
    }

    requestColumnValues(columnId, otherFilters = []) {
        var getUrl = this.props.apiUrl + "?data=";
        var exportObject = {
            columns: [columnId],
            table: {
                pageSize: -1,
                page: 0,
                sorted: [],
                filtered: [...otherFilters],
            },
            distinct: true,
        };

        if (this.state.debajaFilter !== null) {
            exportObject.table.filtered = exportObject.table.filtered.filter(f => f.id !== "debaja");
            exportObject.table.filtered.push({ id: "debaja", value: this.state.debajaFilter });
        }

        getUrl += JSON.stringify(exportObject);
        return axios.get(getUrl, auth.header())
            .then(function (response) {
                return response.data;
            });
    }

    requestData = (pageSize, page, sorted, filtered, columns) => {
        var getUrl = this.props.apiUrl + "?data=";
        var cols = [];
        for (var i = 0; i < columns.length; i++) {
            if (columns[i].columns != undefined)
                for (var j = 0; j < columns[i].columns.length; j++)
                    cols.push(columns[i].columns[j].id);
            else
                cols.push(columns[i].id);
        }
        var exportObject = {
            columns: cols,
            table: {
                pageSize: pageSize,
                page: page,
                sorted: sorted,
                filtered: filtered,
            },
        };
        getUrl += JSON.stringify(exportObject);
        return axios.get(getUrl, auth.header())
            .then(function (response) {
                return response.data;
            });
    };

    fetchData(state, instance) {
        let { selectedRow, debajaFilter } = this.state;
        var self = this;

        self.setState({ tableState: state });

        if (filterTimeout != null) {
            clearTimeout(filterTimeout);
        }

        filterTimeout = setTimeout(function () {
            self.setState({ loading: true });

            let appliedFilters = [...(self.state.persistedFilters || [])];

            if (debajaFilter !== null) {
                appliedFilters = appliedFilters.filter(f => f.id !== "debaja");
                appliedFilters.push({ id: "debaja", value: debajaFilter });
            }

            self.requestData(
                self.state.defaultConfig.pageSize,
                state.page,
                state.sorted,
                appliedFilters,
                self.state.tableColumns
            ).then(res => {
                if (!self.props.multiSelect) {
                    selectedRow = (selectedRow ? res.rows.filter(x => x.pk === selectedRow.pk) : null);
                    if (selectedRow && selectedRow.length) {
                        selectedRow = selectedRow[0];
                        selectedRow.selected = true;
                    }
                    self.setState({
                        data: res.rows,
                        pages: res.pages,
                        loading: false,
                        selectedRow: selectedRow,
                        total: res.total,
                        totalFiltered: res.totalFiltered,
                        totalShow: res.totalShow,
                    });
                }
                else {
                    if (self.state.selectedRows.length > 0) {
                        res.rows.forEach(x => {
                            self.state.selectedRows.forEach(y => { if (x.pk === y.pk) x.selected = true; });
                        });
                    }
                    self.setState({
                        data: res.rows,
                        pages: res.pages,
                        loading: false,
                        total: res.total,
                        totalFiltered: res.totalFiltered,
                        totalShow: res.totalShow,
                    });
                }
            });
        }, (self.state.firstLoad ? 0 : 500));

        if (self.state.firstLoad) {
            self.setState({ firstLoad: false });
        }
    }

    onRowClick(e, t, rowInfo) {
        this.setState((oldState) => {
            let data = oldState.data.slice();
            let copy = Object.assign({}, data[rowInfo.index]);

            for (var i = 0; i < data.length; i++) {
                if (i === rowInfo.index) {
                    data[i].selected = !data[i].selected;
                    if (data[i].selected) {
                        if (this.props.multiSelect) this.state.selectedRows.push(data[i]);
                        this.state.selectedRow = data[i];
                    }
                    else {
                        if (this.props.multiSelect) this.state.selectedRows = this.state.selectedRows.filter(x => x.pk !== data[i].pk);
                        else this.state.selectedRow = null;
                    }
                }
                else if (!this.props.multiSelect) data[i].selected = false;
            }
            return {
                data: data,
                selectAll: (this.state.selectedRows.length===0) ? (false) : ((this.state.selectedRows.length===this.state.total) ? (true) : (this.state.selectAll)),
            }
        });
    }

    getSelectedRow() {
        if (this.state.selectedRow != null)
            return this.state.selectedRow;
        else
            return null;
    }

    getSelectedRows() {
        if (this.state.selectedRows.length > 0)
            return this.state.selectedRows;
        else
            return false;
    }

    unselectAll() {
        this.setState({
            selectedRows: [],
            selectedRow: null
        });
    }

    getSelectedId() {
        var row = this.getSelectedRow();
        if (row)
            return row.pk;
        else
            return false;
    }

    getSelectedIds() {
        var rows = this.getSelectedRows();
        if (rows.length > 0)
            return rows.map(x => x.pk);
        else
            return false;
    }

    updateTable() {
        this.fetchData(this.state.tableState || {});
    }

    columnsChanged(newcolumns) {
        this.setState({ tableColumns: newcolumns });
        this.updateTable();
    }

    columnsResizeChanged(newResized) {
        var self = this;
        if (columnsChangedTimeout != null) {
            clearTimeout(columnsChangedTimeout);
        }
        columnsChangedTimeout = setTimeout(function () {
            self.setState({ resizedColumns: newResized });
        }, 100);
    }

    export(format, mode, landscape) {
        var columns = this.state.tableColumns;
        var getUrl = this.props.exportUrl + "?data=";
        var exportObject = {
            columns: this.state.tableColumns,
            table: {
                pageSize: this.state.defaultConfig.pageSize,
                page: this.state.tableState ? this.state.tableState.page : 0,
                sorted: this.state.tableState ? this.state.tableState.sorted : [],
                filtered: this.state.persistedFilters || [],
            },
            format: format,
            mode: mode,
            landscape: landscape
        };
        getUrl += JSON.stringify(exportObject);
        window.open(getUrl);
    }

    configChanged(config) {
        var tableState = this.state.tableState || {};
        tableState.pageSize = config.pageSize;
        this.setState({ defaultConfig: config, tableState }, () => this.updateTable());
    }

    toggleSelectAll = () => {
        let data = this.state.data;
        data.forEach((e)=> e.selected = (!this.state.selectAll));
        this.setState({
            selectAll: !this.state.selectAll,
            selectedRows: (!this.state.selectAll) ? (this.state.data) : ([]),
            data: data,
        });
    }

    openFilterModal = (columnId) => {
        this.setState(prevState => ({
            modalStates: {
                ...prevState.modalStates,
                [columnId]: true
            }
        }));
    }

    closeFilterModal = (columnId) => {
        this.setState(prevState => ({
            modalStates: {
                ...prevState.modalStates,
                [columnId]: false
            }
        }));
    }

    getCurrentFilters = (columnId) => {
        const persisted = this.state.persistedFilters || [];
        const existing = persisted.find(f => f.id === columnId);
        return existing ? (Array.isArray(existing.value) ? existing.value : []) : [];
    }

    getOtherFilters = (excludeColumnId) => {
        const persisted = this.state.persistedFilters || [];
        return persisted.filter(f => f.id !== excludeColumnId);
    }

    applyColumnFilter = (columnId, values) => {
        const prev = this.state.persistedFilters || [];
        const without = prev.filter(f => f.id !== columnId);
        const next = (values.length > 0)
            ? [...without, { id: columnId, value: values }]
            : without;

        this.setState({ persistedFilters: next }, () => {
            const nextState = { ...(this.state.tableState || {}), filtered: next };
            this.fetchData(nextState);
        });
    }

    clearColumnFilter = (columnId) => {
        const prev = this.state.persistedFilters || [];
        const next = prev.filter(f => f.id !== columnId);
        this.setState({ persistedFilters: next }, () => {
            const nextState = { ...(this.state.tableState || {}), filtered: next };
            this.fetchData(nextState);
        });
    }

    render() {
        const { data, pages, loading } = this.state;
        var toolbarButtons = [];
        const buttons = this.props.buttons || [];
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            var addButton = false;
            if (button.permission != undefined) {
                if (auth.hasPermission(button.permission)) addButton = true;
            }
            else addButton = true;
            if (addButton) {
                if (button.edit) {
                    toolbarButtons.push(<button.component key={"toolbar" + i}
                        onSubmit={() => this.updateTable()}
                        id={() => this.getSelectedId()} 
                        row={() => this.getSelectedRow()} />);

                }
                else if (button.createmultiSelect) {
                    toolbarButtons.push(<button.component key={"toolbar" + i}
                        onSubmit={() => { this.updateTable(); this.unselectAll(); }}
                        multiSelectIDs={() => this.getSelectedIds()} 
                        rows={() => this.getSelectedRows()} />);

                }
                else if (button.create) {
                    toolbarButtons.push(<button.component key={"toolbar" + i}
                        onSubmit={() => this.updateTable()}
                        id={() => this.getSelectedId()}
                    />);

                }
                else if (button.detail) {
                    toolbarButtons.push(<button.component key={"toolbar" + i}
                        id={() => this.getSelectedId()}
                        row={() => this.getSelectedRow()} />);

                }
                else if (button.separator) {
                    toolbarButtons.push(<div key={"separator" + i} className="btn btn-separator"></div>);
                }
            }
        }
        
        let checkSelectAll = [{
            id: "checkbox",
            Header: <input
                        type="checkbox"
                        className="checkbox"
                        checked={this.state.selectAll === true}
                        onChange={() => this.toggleSelectAll()}
                    />,
            filterable: false,
            sortable: false,
            width: 45,
            show: true,
        }]

        const columnasConFiltro = this.state.tableColumns.map(col => {
            const currentFilters = this.getCurrentFilters(col.accessor);
            const isModalOpen = this.state.modalStates && this.state.modalStates[col.accessor];
            const otherFilters = this.getOtherFilters(col.accessor);
            
            return {
                ...col,
                Filter: () => (
                    <ColumnFilter
                        column={col}
                        currentFilters={currentFilters}
                        isModalOpen={isModalOpen}
                        otherFilters={otherFilters}
                        openFilterModal={this.openFilterModal}
                        closeFilterModal={this.closeFilterModal}
                        applyColumnFilter={this.applyColumnFilter}
                        clearColumnFilter={this.clearColumnFilter}
                        requestColumnValues={this.requestColumnValues}
                    />
                ),
                filterMethod: (filter, row) => {
                    if (!filter.value || !Array.isArray(filter.value) || filter.value.length === 0) {
                        return true;
                    }
                    return filter.value.includes(String(row[filter.id]));
                }
            };
        });

        return (
            <div>
                <div className="rt-thead -header mt-1 rt-button-header">
                    <UnsTableHeader
                        title={this.props.title}
                        resizedColumns={this.state.resizedColumns}
                        listColumns={this.state.columns}
                        defaultConfig={this.state.defaultConfig}
                        onChange={(newcolumns) => this.columnsChanged(newcolumns)}
                        onExport={(format, mode, landscape) => this.export(format, mode, landscape)}
                        showExport={(this.props.exportUrl || this.props.onExportFunc ? true : false)}
                        useExportFunc={(this.props.onExportFunc != undefined ? true : false)}
                        onConfigChanged={(config) => this.configChanged(config)}
                        onExportFunc={()=>{if(this.props.onExportFunc)this.props.onExportFunc()}}
                        toolbarButtons={toolbarButtons}
                        onUpdate={(e) => this.updateTable()}
                        multiSelect={this.props.multiSelect}
                        total={{
                            show: this.state.totalShow,
                            filtered: this.state.totalFiltered,
                            total: this.state.total,
                            selected: this.state.selectedRows.length,
                        }}
                        btnHelp={(this.props.btnHelp) ? (this.props.btnHelp) : null}
                        debajaFilter={this.state.debajaFilter}
                        onDebajaFilterChange={(value) => {
                            this.setState({ debajaFilter: value }, () => {
                                this.updateTable();
                            });
                        }}
                    />
                </div>

                {this.props.customSearchElement != null && this.props.customSearchElement}

                <ReactTable
                    columns={(this.props.multiSelect && this.props.selectAll)
                        ? checkSelectAll.concat(columnasConFiltro.concat({ width: 17, resizable: false, filterable: false, private: true }))
                        : columnasConFiltro.concat({ width: 17, resizable: false, filterable: false, private: true })
                    }
                    showPageSizeOptions={false}
                    previousText={"Anterior"}
                    nextText={"Siguiente"}
                    pageText={"Pagina"}
                    ofText={"de"}
                    defaultSorted={this.props.outerSort}
                    defaultFiltered={this.props.outerFilter}
                    manual
                    data={data}
                    pages={pages}
                    loading={loading}
                    onFetchData={this.fetchData}
                    filterable
                    filtered={this.state.persistedFilters}
                    onFilteredChange={(newFiltered) => {
                        this.setState({ persistedFilters: newFiltered }, () => this.updateTable());
                    }}
                    defaultPageSize={this.state.defaultConfig.pageSize}
                    pageSize={this.state.defaultConfig.pageSize}
                    className="-striped -highlight"
                    onResizedChange={(newResized, event) => this.columnsResizeChanged(newResized)}
                    getTrProps={(state, rowInfo, column) => ({
                        onClick: (e, t) => { this.onRowClick(e, t, rowInfo) },
                        style: {
                            background: rowInfo && rowInfo.original.selected ? '#1c2d42' : '',
                            color: rowInfo && rowInfo.original.selected ? 'white' : ''
                        }
                    })}
                />
            </div>
        );
    }
}

export default UnsTable;
