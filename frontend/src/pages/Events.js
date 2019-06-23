import React, { Component } from "react";
import "./Events.css";
import Modal from "../components/modal/Modal";

export default class Events extends Component {
  render() {
    return (
      <React.Fragment>
        <Modal title="Add Event" canCancel canConfirm>
          <p>Modal Content</p>
        </Modal>
        <div className="events-control">
          <p>Share Your Events</p>
          <button className="btn">Create Event</button>
        </div>
      </React.Fragment>
    );
  }
}
