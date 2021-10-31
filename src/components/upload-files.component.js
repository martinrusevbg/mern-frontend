import React, { Component } from "react";
import UploadService from "../services/upload-files.service";
import MyModal from "./mymodal.component";

export default class UploadFiles extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: undefined,
            currentFile: undefined,
            progress: 0,
            message: "",
            fileInfos: [],
            show: false,
            title: '',
            body: '',
            filename: "",
            password: ""
        };
    }

    selectFile = (event) => {
        this.setState({
            selectedFiles: event.target.files,
        });
    }

    setPassword = (event) => {
        this.setState({
            message: ""
        });
        this.setState({
            password: event.target.value
        });
    }

    setFileName(name) {
        this.handleShow();
        this.filename = name;
    }

    delFileName(name) {
        UploadService.deleteFile(name, (event) => {
            UploadService.getFiles();
        }).then((response) => {
            this.setState({
                message: response.data.message
            });
            return UploadService.getFiles();
        })
            .then((files) => {
                this.setState({
                    fileInfos: files.data
                });
            })
            .catch(() => {
                this.setState({
                    message: 'Could not delete the file!'
                });
                return UploadService.getFiles();
            });
    }

    upload = () => {
        let currentFile = this.state.selectedFiles;
        let password = this.state.password;

        if(password === '') {
            this.setState({
                message: "Please, set password!"
            });
            return;
        }

        this.setState({
            progress: 0,
            currentFile: currentFile,
        });

        UploadService.upload(currentFile, password,(event) => {
            this.setState({
                progress: Math.round((100 * event.loaded) / event.total),
            });
        })
            .then((response) => {
                this.setState({
                    message: response.data.message
                });
                return UploadService.getFiles();
            })
            .then((files) => {
                this.setState({
                    fileInfos: files.data
                });
            })
            .catch(() => {
                this.setState({
                    progress: 0,
                    message: "Could not upload the file!",
                    currentFile: undefined,
                    password: '',
                });
            });

        setTimeout(() => {
            this.setState({
                currentFile: '',
                message:'',
                password: '',
                progress: 0
            });
        }, 2000);
    }

    handleShow = () => {
        this.setState({
            show: true,
            title: 'Decrypt File',
            body: ''
        });
    };

    onSubmit= (fromModal) => {
        UploadService.getFile(this.filename, fromModal.password,(event) => {
        })
        this.handleClose();
    };

    handleClose = () => {
        this.setState({
            show: false
        });
    };

    componentDidMount() {
        UploadService.getFiles().then((response) => {
            this.setState({
                fileInfos: response.data,
            });
        });
    }

    render() {
        const {
            selectedFiles,
            currentFile,
            progress,
            message,
            fileInfos,
        } = this.state;

        return (
            <div>
                {currentFile && (
                    <div className="progress">
                        <div
                            className="progress-bar progress-bar-info progress-bar-striped"
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            style={{ width: progress + "%" }}
                        >
                            {progress}%
                        </div>
                    </div>
                )}

                <label className="btn btn-default">
                    <input multiple type="file" onChange={this.selectFile} key={this.state.currentFile} />
                </label>

                <label className="btn btn-default">Password:
                    <input type="password" onChange={this.setPassword} value={this.state.password} />
                </label>

                <button className="btn btn-success"
                        disabled={!selectedFiles}
                        onClick={this.upload}
                >
                    Upload
                </button>

                <div className="alert alert-light" role="alert">
                    {message}
                </div>

                <div className="card">
                    <div className="card-header">List of Files</div>
                    <ul className="list-group list-group-flush">
                        {fileInfos &&
                        fileInfos.map((file, index) => (
                            <li className="list-group-item" key={index}>
                                <a className={`click`} key={file.url} onClick={() => this.setFileName(file.name)} >{file.name}</a>
                                <a className={`click right`} onClick={() => this.delFileName(file.name)}>Delete</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <MyModal
                    show={this.state.show}
                    title={this.state.title}
                    body={this.state.body}
                    onClick={this.handleClose}
                    onSubmit={this.onSubmit}
                    onHide={this.handleClose} />
            </div>
        );
    }
}
