import React, { Component } from "react";
import "./Events.css";
import Modal from "../components/modal/Modal";
import Backdrop from "../components/backdrop/Backdrop";
import AuthContext from "../context/auth-context";
import EventList from "../components/events/EventList";
import Spinner from "../components/spinner/Spinner";

export default class Events extends Component {
  state = {
    creating: false,
    title: "",
    price: 0,
    date: "",
    description: "",
    events: [],
    isLoading: false,
    selectedEvent: null
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchEvents();
  }

  inputCreateEventHandler = event => {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({
      [name]: value
    });
  };

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = () => {
    this.setState({ creating: false });

    if (
      this.state.title.length === 0 ||
      this.state.price.length === 0 ||
      this.state.date.length === 0 ||
      this.state.description.length === 0
    ) {
      return;
    }

    const requestBody = {
      query: `
          mutation {
            createEvent(eventInput: {title: "${
              this.state.title
            }", description: "${this.state.description}", price: ${
        this.state.price
      }, date: "${this.state.date}"}) {
              _id
              title
              description
              date
              price
            }
          }
        `
    };

    const token = this.context.token;

    fetch("http://localhost:4000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed");
        }
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedEvents = [...prevState.events];
          updatedEvents.push({
            _id: resData.data.createEvent._id,
            title: resData.data.createEvent.title,
            description: resData.data.createEvent.description,
            date: resData.data.createEvent.date,
            price: resData.data.createEvent.price,
            creator: {
              _id: this.context.userId
            }
          });
          return { events: updatedEvents };
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  fetchEvents = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          query {
            events {
              _id
              title
              description
              date
              price
              creator {
                _id
                email
              }
            }
          }
        `
    };

    fetch("http://localhost:4000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed");
        }
        return res.json();
      })
      .then(resData => {
        const events = resData.data.events;
        this.setState({ events, isLoading: false });
      })
      .catch(error => {
        console.log(error);
        this.setState({ isLoading: false });
      });
  };

  showDetailHandler = eventId => {
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(
        event => event._id === eventId
      );
      return { selectedEvent: selectedEvent };
    });
  };

  bookEventHandler = () => {};

  render() {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  onChange={this.inputCreateEventHandler}
                />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  onChange={this.inputCreateEventHandler}
                />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  onChange={this.inputCreateEventHandler}
                />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea
                  rows="4"
                  id="description"
                  name="description"
                  onChange={this.inputCreateEventHandler}
                />
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.title}
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>
              $ {this.state.selectedEvent.price} -{" "}
              {new Date(this.state.selectedEvent.date).toLocaleDateString()}
            </h2>
            <h2>{this.state.selectedEvent.description}</h2>
          </Modal>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>Share Your Events</p>
            <button className="btn" onClick={this.startCreateEventHandler}>
              Create Event
            </button>
          </div>
        )}
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <EventList
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />
        )}
      </React.Fragment>
    );
  }
}
