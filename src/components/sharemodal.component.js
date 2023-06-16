import React, { Component } from "react";
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class ShareModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount() {
    }

    setEmail= (event) => {
        this.email = event.target.value;
    }
    setPhone= (event) => {
        this.phone = event.target.value;
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
                        <label className="btn btn-default">Enter Email:
                            <input type="email" onChange={this.setEmail} />
                        </label>
                        <label className="btn btn-default">Enter Phone:
                            <input type="phone" onChange={this.setPhone} />
                        </label>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.props.onClick()} >Close</Button>
                        <Button variant="primary" onClick={() => this.props.onSubmit({ email: this.email, phone:this.phone })}  >Submit</Button>
                    </Modal.Footer>

                </Modal>
            </div>
        )
    };
}
