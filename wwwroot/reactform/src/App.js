import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, FormGroup, Form, Col, ControlLabel, FormControl, Panel, Grid, Row, Table } from 'react-bootstrap';
import serializeForm from 'form-serialize';
import update from 'react-addons-update';

import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalClose,
  ModalBody,
  ModalFooter
} from 'react-modal-bootstrap';


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tableData: [],
      editMode: false,
      editRecordData: [],
      falseRecord: [],
      isOpen: false
    };


    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._loadServiceAPIData = this._loadServiceAPIData.bind(this);
    this._load = this._loadServiceAPIData.bind(this);
    this._deleteItem = this._deleteItem.bind(this);
    // this._editItem = this._editItem.bind(this);
    this._loadEditItem = this._loadEditItem.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this.openModal = this.openModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  openModal() {
    this.setState({
      isOpen: true
    });
  };

  hideModal(){
    this.setState({
      isOpen: false
    });
  };

  componentDidMount() {
    this._loadServiceAPIData();
  }

  _loadServiceAPIData() {

    const self = this;
    fetch('/api/values')
      .then(function (response) {
        return response.json();
      }).then(function (responseData) {
        console.log("LoadServiceAPI: " + responseData);
        self.setState({ tableData: responseData });
      });
  }

  _handleFormSubmit(event) {
    event.preventDefault();

    const self = this;
    let formData = serializeForm(event.target, { hash: true });
    console.log("HandleFormSubmit: " + JSON.stringify(formData));

    fetch('/api/values', {
      method: 'post',
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Accept": "application/json",
      },
      mode: 'cors',
      body: JSON.stringify(formData)
    }).then(function (res) {
      console.log(res);
      self._loadServiceAPIData(); //Reload the data
      console.log("End of Fetch: " + JSON.stringify(res))

      //Reset the editMode value to false
      self.setState({ editMode: false, isOpen: false });
    });
  }

  _deleteItem(event) {
    event.preventDefault();
    console.log("starting to delete");

    const self = this;
    var itemId = event.target.value;
    fetch('/api/values/' + itemId, {
      method: 'DELETE',
      mode: 'cors'
    }).then(function (response) {
      console.log("Response:" + response);
      self._loadServiceAPIData();
    });
  }

  _loadEditItem(event) {
    event.preventDefault();
    const editId = event.target.value;

    const self = this;

    fetch('/api/values/' + editId,
      {
        method: 'GET',
        mode: 'cors'
      }).then(function (response) {
        return response.json();
      }).then(function (responseData) {
        console.log("RESPONSE: " + JSON.stringify(responseData));
        self.setState({ editMode: true, editRecordData: responseData, isOpen: true });
      });
  }

  // _editItem(event) {
  //   event.preventDefault();

  //   var value = event.target.value;
  //   alert("Edit Item + value");
  // }

  _handleChange(event) {

   const self = this;

    const elementName = event.target.name;
    const elementValue = event.target.value;

    console.log(elementName + " : " + elementValue);

    self.setState({
      falseRecord: [],
      editRecordData: update(self.state.editRecordData, { 1: { elementName: { $set: elementValue } } })
    });
  }


  render() {

    // let subModalDialogStyles = {
    //   base: {
    //     bottom: -600,
    //     transition: 'bottom 0.4s'
    //   },
    //   open: {
    //     bottom: 0
    //   }
    // };

    var output = (<div></div>);
    const dtSource = this.state.tableData;
    const dtRecord = this.state.editRecordData;
    var editForm = (<div></div>);

    // console.log("Render: " + dtSource);

    const self = this;

    if (self.state.editMode) {

      Object.keys(dtRecord).map(function (key) {
        editForm =
          (
            <div>

              <FormGroup controlId="formHorizontalInventoryId">
                <Col componentClass={ControlLabel} sm={2}>
                  ID:
           </Col>

                <Col sm={10}>
                  <FormControl type="text" name="InventoryId" defaultValue={dtRecord[key]["InventoryId"]} />
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalItemName">
                <Col componentClass={ControlLabel} sm={2}>
                  Item Name
          </Col>
                <Col sm={10}>
                  <FormControl type="text" name="Name" placeholder="Item Name" defaultValue={dtRecord[key]["Name"]} onChange={self._handleChange} />
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalQuantity">
                <Col componentClass={ControlLabel} sm={2}>
                  Quantity
          </Col>
                <Col sm={10}>
                  <FormControl type="number" name="Quantity" placeholder="Quantity" defaultValue={dtRecord[key]["quantity"]} onChange={self._handleChange} />
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorzontalDiscription">
                <Col componentClass={ControlLabel} sm={2}>
                  Discription
            </Col>
                <Col sm={10}>
                  <FormControl type="text" name="description" placeholder="Description" defaultValue={dtRecord[key]["description"]}  componentClass="textarea" onChange={self._handleChange} />
                </Col>
              </FormGroup>

            </div>
          )
      });

      output = (
        <div className='layout-page'>
          <main className='layout-main'>
            <div className='container'>

              <Modal isOpen={this.state.isOpen} size='modal-lg' onRequestHide={this.hideModal}>
                <Form horizontal onSubmit={self._handleFormSubmit}>
                  <ModalHeader>
                    <ModalTitle>Edit Item</ModalTitle>
                  </ModalHeader>
                  <ModalBody>
                    <div>
                      {editForm}
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <button className='btn btn-default' onClick={this.hideModal}>
                      Close
                  </button>
                    <button className='btn btn-primary'>
                      Save changes
                  </button>
                  </ModalFooter>
                </Form>
              </Modal>
            </div>
          </main>
        </div>);

    } else {

      const dtSource = this.state.tableData;
      console.log("Render: " + dtSource);

      const self = this;

      const rows =
        Object.keys(dtSource).map(function (key) {
          return (<tr>
            <td>{key}</td>
            <td>{dtSource[key]["name"]}</td>
            <td>{dtSource[key]["quantity"]}</td>
            <td>{dtSource[key]["description"]}</td>
            <td>
              <button type="submit" value={dtSource[key]["inventoryId"]} onClick={self._deleteItem}>Delete</button>
              <button type="submit" value={dtSource[key]["inventoryId"]} onClick={self._loadEditItem}>Edit</button>
            </td>
          </tr>);

        });


      const formInstance = (

        <Form horizontal onSubmit={this._handleFormSubmit}>

          <FormGroup controlId="formHorizontalItemName">
            <Col componentClass={ControlLabel} sm={2}>
              Name
      </Col>
            <Col sm={10}>
              <FormControl type="text" name="name" placeholder="Name" />
            </Col>
          </FormGroup>

          <FormGroup controlId="formHorizontalQuantity">
            <Col componentClass={ControlLabel} sm={2}>
              Quantity
          </Col>
            <Col sm={10}>
              <FormControl type="number" name="quantity" placeholder="Quantity" />
            </Col>
          </FormGroup>

          <FormGroup controlId="formHorizontalDiscription">
            <Col componentClass={ControlLabel} sm={2}>
              Description
          </Col>
            <Col sm={10}>
              <FormControl type="text" name="description" componentClass="textarea" placeholder="Description" />
            </Col>
          </FormGroup>


          <FormGroup>
            <Col smOffset={7} sm={8}>
              <Button type="submit">
                Add
        </Button>
            </Col>
          </FormGroup>

        </Form>

      );

      const tableInstance = (
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      );

      output = (
        <div className="App">
          <Grid>
            <Row className="show-grid">
              <Col xs={6} md={2}></Col>
              <Col xs={6} md={8}>
                <Panel>
                  {formInstance}
                </Panel>
              </Col>
            </Row>
          </Grid>
          {tableInstance}
        </div>
      );
    }

    let subModalDialogStyles = {
      base: {
        bottom: -600,
        transition: 'bottom 0.4s'
      },
      open: {
        bottom: 0
      }
    };
    return (
      <div className="App">
        {output}
      </div>


    );
  }
}
export default App;
