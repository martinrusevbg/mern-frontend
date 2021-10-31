import React, { Component } from "react";
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class MyModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount() {
    }

    setPassword= (event) => {
        this.password = event.target.value;
    }

    render() {

        return (
            <div>
                <Modal show={this.props.show} onHide={() => this.props.onHide()}>

                    <Modal.Header closeButton>
                        <Modal.Title>
                            {this.props.title}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {this.props.body}
                        <label className="btn btn-default">Enter Password:
                            <input type="password" onChange={this.setPassword} />
                        </label>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.props.onClick()} >Close</Button>
                        <Button variant="primary" onClick={() => this.props.onSubmit({ password: this.password })}  >Submit</Button>
                    </Modal.Footer>

                </Modal>
            </div>
        )
    };
}
