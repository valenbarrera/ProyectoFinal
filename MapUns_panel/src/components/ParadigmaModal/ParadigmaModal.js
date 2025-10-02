import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from "axios";
import api from "../../api";
import auth from "../../auth";
import serialize from 'form-serialize';

import { NavItem, NavLink, Row, UncontrolledTooltip, Tooltip, Label, FormFeedback, Col, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Card, CardHeader, CardBody } from 'reactstrap';

import jsonToFormData from 'json-form-data';

import Loader from '../Loader'
import "./ParadigmaModal.scss";

class ParadigmaModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: (this.props.initOpen ? true : false),
            navButton: (this.props.navButton ? true : false),
            success: null,
            allowed: true,
            message: undefined,
            error: undefined,
            id: this.NewID(),
            backdrop: (!this.props.hideBackdrop ? true : false),
            keyboard: (this.props.keyboard ? true : false),

            // Propiedad para permitir cerrar el modal haciendo click fuera de la modal. En caso de que no haya postUrl se permitira de todos modos. (Ventanas de detalle)
            backdropToggle: (this.props.backdropToggle ? true : (!this.props.postUrl ? true : false)),

        };
    }

    static propTypes = {
        id: PropTypes.func,
        initOpen: PropTypes.bool,

        showConfirmationMessages: PropTypes.bool,

        onSubmit: PropTypes.func,
        buttonIcon: PropTypes.string,
        title: PropTypes.string,
        buttonTitle: PropTypes.string,
        saveButton: PropTypes.bool,
        saveReloadButton: PropTypes.bool,
        closeButton: PropTypes.bool,
        multiSelectIds: PropTypes.func,
        multiSelect: PropTypes.bool,
        successMessage: PropTypes.string,
        missingIdMessage: PropTypes.string,
        downloadUrl: PropTypes.string,
        postUrl: PropTypes.string,
        getUrl: PropTypes.string,
        danger: PropTypes.bool,
        warning: PropTypes.bool,
        onGotData: PropTypes.func,
        onGotErrors: PropTypes.func,
        onPreSubmit: PropTypes.func,
        buttonLabel: PropTypes.string,
        fields: PropTypes.any,
        onClose: PropTypes.func,
        onOpen: PropTypes.func,
        onCleanForm: PropTypes.func,
        fileUploader: PropTypes.bool,
        fileDownloader: PropTypes.bool,
        saveButtonLabel: PropTypes.string,
        saveReloadButtonLabel: PropTypes.string,
        cancelButtonLabel: PropTypes.string,
        buttonClass: PropTypes.string,

        hideBackdrop: PropTypes.bool,
        keyboard: PropTypes.bool,

        notAllowedMessage: PropTypes.string,

        className: PropTypes.string,

        onValidation: PropTypes.func,

        navButton: PropTypes.bool,
        nav: PropTypes.any,
    }

    componentWillMount() {
        this.state.loading = this.props.Loading;
    }

    refreshState() {
        this.setState({
            visible: true,
            success: null,
            missingId: false,
            loading: true,
            allowed: true,
            message: undefined,
            tooltipOpen: false,
        });
        this.get((response) => {
            this.setState({
                loading: false,
                success: null,
                missingId: false,
                allowed: response.allowed,
                message: response.message,
                tooltipOpen: false,
            });
            if (this.props.onGotData && response.allowed != false)
                this.props.onGotData(response);
        });
    }

    toggleModal(e, forceOpen = false) {
        if (e)
            e.preventDefault();
        if (!this.state.loading)
            if (this.state.visible && !forceOpen) {
                var self = this;
                if (self.props.onClose) {
                    self.props.onClose();
                }
                this.setState({
                    visible: !this.state.visible,
                    tooltipOpen: false,
                    loading: true,
                });
                setTimeout(function () {
                    self.setState({
                        loading: false,
                        success: null,
                        missingId: false,
                        allowed: true,
                        message: undefined,
                        tooltipOpen: false,
                    });
                }, 200);
            }
            else if (this.state.visible && forceOpen) {

            }
            else {
                if (this.props.onOpen) {
                    this.props.onOpen();
                }
                if (this.props.id != undefined)
                    if (this.props.id() === false) {
                        this.setState({
                            visible: true,
                            loading: false,
                            missingId: true,
                            tooltipOpen: false,
                        });
                        return;
                    }
                if (this.props.getUrl == undefined) {
                    this.setState({
                        visible: true,
                        loading: false,
                        success: null,
                        missingId: false,
                        allowed: true,
                        message: undefined,
                        tooltipOpen: false,
                    });
                }
                else if (this.props.getUrl && (this.props.multiSelect == undefined ||
                    this.props.multiSelect == false || this.props.multiSelectIds().length > 0)) {
                    this.setState({
                        visible: true,
                        success: null,
                        missingId: false,
                        loading: true,
                        allowed: true,
                        message: undefined,
                        tooltipOpen: false,
                    });
                    this.get((response) => {
                        this.setState({
                            loading: false,
                            success: null,
                            missingId: false,
                            allowed: response.allowed,
                            message: response.message,
                            tooltipOpen: false,
                        });
                        if (this.props.onGotData && response.allowed != false)
                            this.props.onGotData(response);
                    });
                }
                else {
                    this.setState({
                        visible: true,
                        loading: false,
                        missingId: true,
                        tooltipOpen: false,
                    });
                }
            }
    }


    modalClass() {
        if (this.state.success != null) {
            if (this.state.success) {
                return "modal-success ";
            } else {
                return "modal-warning ";
            }
        } else if (this.state.missingId) {
            return "modal-warning ";
        }
        else if (this.props.warning) {
            return "modal-warning ";
        }
        else if (this.props.danger) {
            return "modal-danger ";
        }
        else {
            return "modal-primary ";
        }
    }

    onSubmit(e, toggle = true) {
        if (e)
            e.preventDefault();
        this.setState({ loading: true });
        this.submit((response) => {
            this.setState({ loading: false });
            if (response.success) {
                if (toggle) {
                    if (this.props.showConfirmationMessages) {
                        this.setState({ success: true });
                        if (this.props.successMessage == undefined || this.props.successMessage == "")
                            this.toggleModal();
                    } else {
                        this.toggleModal();
                    }
                }
                else
                    this.cleanForm();
            }
            else {
                this.setState({ success: false });
            }
        });

    }

    postUrl() {
        if (this.props.id != undefined) {
            var id = this.props.id();
            return this.props.postUrl + id + "/";
        } else {
            return this.props.postUrl;
        }
    }

    getUrl() {
        if (this.props.id != undefined) {
            var id = this.props.id();
            return this.props.getUrl + id + "/" + (this.props.multiSelect ? "?ids=" + this.props.multiSelectIds() : "");
        } else {
            return this.props.getUrl + (this.props.multiSelect ? "?ids=" + this.props.multiSelectIds() : "");
        }
    }

    get(callback) {
        var self = this;
        axios.get(this.getUrl(), auth.header())
            .then(function (response) {
                if (response.status == 200) {
                    var data = response.data;
                    if (data.allowed == false) {
                        if (callback) callback({ "success": false, "allowed": false, "message": data.message });
                    }
                    else {
                        data.allowed = true;
                        var inputs = self.form.querySelectorAll("input, select, textarea");
                        for (var i = 0; i < inputs.length; i++) {

                            if (!inputs[i].classList.contains('paradigma-not-set') && inputs[i].type != "file")
                                if (data[inputs[i].name] != undefined) {
                                    inputs[i].value = data[inputs[i].name];
                                }
                        }
                        if (data.success) {
                            if (callback) callback(data);
                        } else {
                            if (callback) callback(data);
                        }
                    }
                }
                else {
                    if (callback) callback({ "success": false });
                }
            })
            .catch(function (e) {
                if (callback) callback({ "success": false });
            })
    }

    cleanForm() {
        var inputs = this.form.querySelectorAll("input, select, textarea");
        for (var i = 0; i < inputs.length; i++) {
            if (!inputs[i].classList.contains('paradigma-not-set'))
                inputs[i].value = "";
        }
        this.setState({
            loading: false,
            visible: true,
            success: null,
            allowed: true,
            message: undefined,
            error: undefined,
        });
        if (this.props.onCleanForm) this.props.onCleanForm();
    }

    submit(callback) {
        var self = this;
        var postData = this.state;
        var inputs = this.form.querySelectorAll("input.form-control, textarea.form-control, .react-checkbox-tree > input");
        var postData;

        // if (this.props.onValidation) if (!this.props.onValidation()) return;
        if (this.props.onValidation) if (!this.props.onValidation()) {
            let data = { success: false };
            if (callback) callback(data);
            return;
        };

        if (this.props.fileUploader) postData = new FormData(this.form);
        else postData = serialize(this.form, { hash: true, empty: true });

        // if (self.props.onPreSubmit) postData = JSON.stringify(self.props.onPreSubmit());
        if (self.props.onPreSubmit) postData = self.props.onPreSubmit();

        if ((self.props.onPreSubmit) && (this.props.fileUploader)) {
            postData = jsonToFormData(postData);
        }

        if (this.props.postUrl != undefined && this.props.postUrl != "") {
            axios.post(this.postUrl(), postData, auth.header())
                .then(function (response) {
                    if (response.status == 200) {
                        var data = response.data;
                        if (data.success) {
                            if (self.props.fileDownloader) {
                                var win = window.open(self.props.downloadUrl + data.key + "/", '_blank');
                            }
                            self.setState({ message: data.message });
                            if (self.props.onSubmit) self.props.onSubmit(data);
                            if (callback) callback(data);
                        }
                        else {
                            var errors = data.errors;
                            self.setState({ error: data.error, message: data.message });
                            for (var i = 0; i < inputs.length; i++) {
                                let inputName = inputs[i].name.replace('_id', '');
                                var error = errors[inputName];
                                if (error != undefined) {
                                    inputs[i].classList.add("is-invalid");
                                    var InvalidFeedback = Array.from(inputs[i].parentElement.children).filter(x => x.classList.contains('invalid-feedback'));
                                    if (InvalidFeedback.length > 0)
                                        InvalidFeedback[0].innerHTML = error;
                                } else {
                                    if (inputs[i].classList.contains("is-invalid")) {
                                        inputs[i].classList.remove("is-invalid");
                                        var InvalidFeedback = Array.from(inputs[i].parentElement.children).filter(x => x.classList.contains('invalid-feedback'));
                                        if (InvalidFeedback.length > 0)
                                            InvalidFeedback[0].innerHTML = "";
                                    }
                                }
                            }
                            if (self.props.onGotErrors) self.props.onGotErrors(data.errors);
                            if (callback) callback(data);
                        }
                    }
                    else {
                        if (callback) callback({ "success": false });
                    }
                })
                .catch(function (e) {
                    if (callback) callback({ "success": false });
                })
        } else {
            postData.success = true;
            self.props.onSubmit(postData);
            if (callback) callback(postData);
        }
    }

    clearFeedback(e) {
        e.target.classList.remove("is-invalid");
        var childs = e.target.parentElement.children;
        childs[childs.length - 1].innerHTML = "";
    }

    NewID() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    render() {
        var body;
        var encType = "";
        if (this.props.fileUploader)
            encType = "multipart/form-data";

        if (this.props.fields) {
            var fields = [];
            for (var i = 0; i < this.props.fields.length; i++) {
                var field = this.props.fields[i];
                if (field.component) {
                    fields.push(<field.component />)
                } else {
                    fields.push(<Input type={field.type} />)
                }
            }
            body = <ModalBody>
                {this.state.message != "" && this.state.message != null &&
                    <Label className="badge badge-danger w-100">{this.state.message}</Label>}
                <form autoComplete={false} className={(this.state.loading ? "d-none" : "")}
                    encType={encType} ref={(form) => { this.form = form; }} onSubmit={(e) => this.onSubmit(e)} >
                    {fields}
                </form>
            </ModalBody>;
        } else {
            body = <ModalBody >
                {this.state.message != "" && this.state.message != null &&
                    <Label className="badge badge-danger w-100">{this.state.message}</Label>}
                <form autoComplete={"off"} className={(this.state.loading ? "d-none" : "")}
                    encType={encType} ref={(form) => { this.form = form; }} onSubmit={(e) => this.onSubmit(e)} >
                    {this.state.error && <div className="col-12 invalid-feedback d-block pl-0 mt-0 mb-2">{this.state.error}</div>}
                    {this.props.children}
                </form>
            </ModalBody>;
        }

        var saveButtonLabel = "Guardar";
        var saveReloadButtonLabel = "Guardar y Limpiar Formulario";
        var cancelButtonLabel = "Cancelar";
        if (this.props.saveButtonLabel)
            saveButtonLabel = this.props.saveButtonLabel;
        if (this.props.saveReloadButtonLabel)
            saveReloadButtonLabel = this.props.saveReloadButtonLabel;
        if (this.props.cancelButtonLabel)
            cancelButtonLabel = this.props.cancelButtonLabel;

        var buttons = <ModalFooter>

            {this.props.saveReloadButton && <Button className={(this.props.danger && "btn-danger") ||
                (this.props.warning && "btn-warning") || (!this.props.danger && "btn-success")}
                color="visible" disabled={this.state.loading} onClick={(e) => this.onSubmit(null, false)}>{saveReloadButtonLabel}</Button>}

            {this.props.saveButton && <Button className={(this.props.danger && "btn-danger") ||
                (this.props.warning && "btn-warning") || (!this.props.danger && "btn-success")}
                color="visible" disabled={this.state.loading} onClick={(e) => this.onSubmit()}>{saveButtonLabel}</Button>}

            {' '}

            {this.props.closeButton && <Button color="secondary" disabled={this.state.loading}
                onClick={(e) => this.toggleModal(e)}>{cancelButtonLabel}</Button>}
        </ModalFooter>;

        var successMessage = this.props.successMessage;
        if (this.state.message != undefined)
            successMessage = this.state.message;
        var confirm = <ModalBody className="text-center">
            <h3>{successMessage}</h3>
            <h1><i className="icon-check icons font-5xl d-block mt-4"></i></h1>
        </ModalBody>

        var missingId = <ModalBody className="text-center">
            <h3>{this.props.missingIdMessage}</h3>
            <h1><i className="icon-close icons font-5xl d-block mt-4"></i></h1>
        </ModalBody>

        var notAllowedMessage = this.props.notAllowedMessage;
        if (this.state.message != undefined)
            notAllowedMessage = this.state.message;

        var notAllowed = <ModalBody className="text-center">
            <h3>{notAllowedMessage}</h3>
            <h1><i className="icon-ban icons font-5xl d-block mt-4"></i></h1>
        </ModalBody>

        var buttonContent = <i className={this.props.buttonIcon}></i>


        var buttonId = this.state.id;

        var buttonClass = "icon btn btn-secondary btn-sm h-100 ";
        if (this.props.buttonClass)
            buttonClass += this.props.buttonClass;

        let forceToggle = (this.state.missingId ? false :
            (!this.state.allowed ? false : true && !this.state.backdropToggle));

        if (this.props.navButton) {
            let nav = this.props.nav;
            var navtag = (nav.tag ? nav.tag : "li");

            return (
                <a id={buttonId.toString()} href={'#'} onClick={(e) => this.toggleModal(e, true)} className={nav.className ? nav.className : "nav-item nav-link"}>
                    <i className={nav.icon}></i>{nav.name}

                    {this.props.buttonLabel && this.props.buttonLabel}

                    <Modal keyboard={this.state.keyboard} isOpen={this.state.visible}
                        toggle={(e) => this.toggleModal(e, forceToggle)} backdrop={this.state.backdrop}
                        className={this.modalClass() + this.props.className}>
                        <ModalHeader toggle={() => this.toggleModal()}>{this.props.title}</ModalHeader>

                        {!!!this.state.success && this.state.allowed && !this.state.missingId && body}
                        {!!!this.state.success && this.state.allowed && !this.state.missingId && buttons}
                        {this.state.success && !this.state.missingId && this.props.showConfirmationMessages && confirm}
                        {!this.state.allowed && notAllowed}
                        {this.state.missingId && missingId}


                        {this.state.loading && <Loader></Loader>}
                    </Modal>
                </a>);
        }
        else {
            return (
                <button id={buttonId.toString()} className={buttonClass} onClick={(e) => this.toggleModal(e, true)}>
                    {
                        this.props.buttonTitle &&
                        <Tooltip placement="bottom" target={buttonId.toString()}
                            toggle={(e) => this.setState({ tooltipOpen: !this.state.tooltipOpen })}
                            isOpen={this.state.tooltipOpen && !this.state.visible}>
                            {this.props.buttonTitle}
                        </Tooltip>
                    }
                    {buttonContent}
                    {this.props.buttonLabel && this.props.buttonLabel}

                    <Modal keyboard={this.state.keyboard} isOpen={this.state.visible}
                        toggle={(e) => this.toggleModal(e, forceToggle)} backdrop={this.state.backdrop}
                        className={this.modalClass() + this.props.className}>
                        <ModalHeader toggle={() => this.toggleModal()}>{this.props.title}</ModalHeader>

                        {!!!this.state.success && this.state.allowed && !this.state.missingId && body}
                        {!!!this.state.success && this.state.allowed && !this.state.missingId && buttons}
                        {this.state.success && !this.state.missingId && this.props.showConfirmationMessages && confirm}
                        {!this.state.allowed && notAllowed}
                        {this.state.missingId && missingId}


                        {this.state.loading && <Loader></Loader>}
                    </Modal>
                </button>
            );
        }
    }
}

export default ParadigmaModal;
