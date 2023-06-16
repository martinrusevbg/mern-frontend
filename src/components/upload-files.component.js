import React, { Component } from 'react';
import UploadService from "../services/upload-files.service";
import MyModal from "./mymodal.component";
import ShareModal from "./sharemodal.component";
import DataTable from 'react-data-table-component';
import {RiDeleteBin5Fill, RiFileInfoFill, RiShareLine} from 'react-icons/ri';

const link = {
    color: '#198754',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontsize: '20px'
};

export default class UploadFiles extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: undefined,
            currentFile: undefined,
            progress: 0,
            page: 1,
            search: '',
            info: '',
            countPerPage: 10,
            message: "",
            fileInfos: [],
            columns : [
                {
                    name: 'File Name',
                    cell: row => <a style={link} key={row.url} onClick={() => this.setFileName(row.name)} >{row.name}</a>
                },
                {
                    name: 'Info',
                    cell: row => <a style={link} key={row.url} onClick={() => this.getInfo(row.id)} ><RiFileInfoFill  size={25}/> </a>,
                    right: true,
                    width: '90px'
                },
                {
                    name: 'Share',
                    cell: row => <a style={link} key={row.url} onClick={() => this.shareFileName(row.name)} ><RiShareLine  size={25}/> </a>,
                    right: true,
                    width: '90px'
                },
                {
                    name: 'Delete',
                    cell: row => <a style={link} key={row.url} onClick={() => this.delFileName(row.name)} ><RiDeleteBin5Fill size={25}/></a>,
                    right: true,
                    width: '90px'
                }
            ],
            show: false,
            title: '',
            body: '',
            showShare: false,
            titleShare: '',
            bodyShare: '',
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

    shareFileName(name) {
        this.handleShowShare();
        this.filename = name;
    }

    delFileName(name) {
        UploadService.deleteFile(name, (event) => {
            UploadService.getFiles(this.state.page, this.state.countPerPage, this.state.search);
        }).then((response) => {
            this.setState({
                message: response.data.message
            });
            return UploadService.getFiles(this.state.page, this.state.countPerPage, this.state.search);
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
                return UploadService.getFiles(this.state.page, this.state.countPerPage, this.state.search);
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
                return UploadService.getFiles(this.state.page, this.state.countPerPage, this.state.search);
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

    handleShowShare = () => {
        this.setState({
            showShare: true,
            titleShare: 'Share File',
            bodyShare: ''
        });
    };

    onSubmit= (fromModal) => {
        UploadService.getFile(this.filename, fromModal.password,(event) => {
        })
        this.handleClose();
    };

    onSubmitShare= (fromModal) => {
        UploadService.shareFile(this.filename, fromModal.email, fromModal.phone ,(event) => {
        }).then((response) => {
            if(response)
                return UploadService.getFiles(this.state.page, this.state.countPerPage, this.state.search);
        })
        this.handleCloseShare();
    };

    handleCloseShare = () => {
        this.setState({
            showShare: false
        });
    };

    handleClose = () => {
        this.setState({
            show: false
        });
    };

    setPage = (page) => {
        this.setState({
            page: page
        });
        UploadService.getFiles(page, this.state.countPerPage, this.state.search).then((response) => {
            this.setState({
                fileInfos: response.data,
            });
        });
    };

    getInfo = (id) => {
        UploadService.getFileInfo(id).then((response) => {
        });
    };

    onChangeSearchTitle = (e) => {
        const searchTitle = e.target.value;
        this.setState({
            search: searchTitle
        });
        UploadService.getFiles(this.state.page, this.state.countPerPage, searchTitle).then((response) => {
            this.setState({
                fileInfos: response.data,
            });
        });
    };

    handlePerRowsChange(perPage) {
        this.setState({
            countPerPage: perPage
        });
        UploadService.getFiles(this.state.page, perPage, this.state.search).then((response) => {
            this.setState({
                fileInfos: response.data,
            });
        });
    }

    componentDidMount() {
        UploadService.getFiles(this.state.page, this.state.countPerPage, this.state.search).then((response) => {
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
            columns,
            countPerPage,
            page
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
                   Select file: <input multiple type="file" onChange={this.selectFile} key={this.state.currentFile} />
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
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by file name"
                        value={this.state.search}
                        onChange={this.onChangeSearchTitle}
                    />
                    <DataTable
                        // title="Your files"
                        columns={columns}
                        data={fileInfos.files}
                        highlightOnHover
                        pagination
                        paginationServer
                        paginationTotalRows={fileInfos.total}
                        paginationPerPage={countPerPage}
                        onChangeRowsPerPage={ perpage => this.handlePerRowsChange(perpage)}
                        onChangePage={page => this.setPage(page)}
                    />
                    {/*<ul className="list-group list-group-flush">*/}
                    {/*    {fileInfos &&*/}
                    {/*    fileInfos.map((file, index) => (*/}
                    {/*        <li className="list-group-item" key={index}>*/}
                    {/*            <a className={`click`} key={file.url} onClick={() => this.setFileName(file.name)} >{file.name}</a>*/}
                    {/*            <a className={`click right`} onClick={() => this.delFileName(file.name)}>Delete</a>*/}
                    {/*        </li>*/}
                    {/*    ))}*/}
                    {/*</ul>*/}
                </div>
                <MyModal
                    show={this.state.show}
                    title={this.state.title}
                    body={this.state.body}
                    onClick={this.handleClose}
                    onSubmit={this.onSubmit}
                    onHide={this.handleClose} />
                <ShareModal
                    show={this.state.showShare}
                    title={this.state.titleShare}
                    body={this.state.bodyShare}
                    onClick={this.handleCloseShare}
                    onSubmit={this.onSubmitShare}
                    onHide={this.handleCloseShare} />
            </div>
        );
    }
}
