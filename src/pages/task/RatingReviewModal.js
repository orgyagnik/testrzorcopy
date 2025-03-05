import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
//import { databaseRoleCode } from '../../settings';
import { connect } from "react-redux";
import APIService from '../../api/APIService';

function RatingReviewModal({ ratingModalShow, setShowRatingModal, taskIdForRating, SetTaskIdForRating, userData }) {
  const [taskRating, SetTaskRating] = useState(0);
  let taskReviewInput = useRef();
  const [processForRating, setProcessForRating] = useState(false);
  const ratingModalClose = () => setShowRatingModal(false);

  /*const showRatingModal = (tid) => {
    setShowRatingModal(true);
    SetTaskIdForRating(tid);
    SetTaskRating('');
    if(taskReviewInput.current !== undefined)
      taskReviewInput.current.value = '';
  }*/

  useEffect(() => {
    if (!ratingModalShow) {
      SetTaskRating('');
      SetTaskIdForRating(0);
      if (taskReviewInput.current !== undefined)
        taskReviewInput.current.value = '';
    }
  }, [ratingModalShow]);

  const handleSaveRatingReview = (e) => {
    setProcessForRating(true);
    let params = {};
    params['taskid'] = taskIdForRating;
    //params['staffid'] = userData?.role_code === databaseRoleCode.clientCode ? userData?.userid : userData?.id;
    params['staffid'] = userData?.id;
    params['rating'] = taskRating;
    params['review'] = taskReviewInput?.current?.value;
    APIService.addRatingReview(params)
      .then((response) => {
        if (response.data?.status) {
          toast.success(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
          setProcessForRating(false);
          ratingModalClose();
        }
        else {
          toast.error(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
          setProcessForRating(false);
        }
      })
      .catch((error) => {
        toast.error(error, {
          position: toast.POSITION.TOP_RIGHT
        });
        setProcessForRating(false);
      });
  }

  return (
    <Modal size="md" show={ratingModalShow} onHide={ratingModalClose} centered>
      <Modal.Header closeButton className="py-5 px-10">
        <Modal.Title className="font-20 dark-1 mb-0">Rate and Complete Task</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-9 px-10">
        <h4 className="mb-3 dark-1">How would you rate your overall task experience?</h4>
        <div className="rating-block">
          <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
            <Form.Check.Label htmlFor="rate1" className="m-0 pe-7 dark-1 ">Above and beyond. Went over the expectation
              <div className="star-rate mt-1">
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
              </div>
            </Form.Check.Label>
            <Form.Check.Input className="float-end" type="radio" name="rateRadio" id="rate1" defaultChecked={taskRating === 1 ? true : false} onChange={(e) => { SetTaskRating(5) }} />
          </Form.Check>
          <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
            <Form.Check.Label htmlFor="rate2" className="m-0 pe-7 dark-1 ">On time and worked as requested
              <div className="star-rate mt-1">
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
              </div>
            </Form.Check.Label>
            <Form.Check.Input className="float-end" type="radio" name="rateRadio" id="rate2" defaultChecked={taskRating === 2 ? true : false} onChange={(e) => { SetTaskRating(4) }} />
          </Form.Check>
          <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
            <Form.Check.Label htmlFor="rate3" className="m-0 pe-7 dark-1 ">Complete but took too long
              <div className="star-rate mt-1">
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
              </div>
            </Form.Check.Label>
            <Form.Check.Input className="float-end" type="radio" name="rateRadio" id="rate3" defaultChecked={taskRating === 3 ? true : false} onChange={(e) => { SetTaskRating(3) }} />
          </Form.Check>
          <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
            <Form.Check.Label htmlFor="rate4" className="m-0 pe-7 dark-1 ">Satisfactory but with minor bugs
              <div className="star-rate mt-1">
                <span className="icon-star-fill text-primary pe-1"></span>
                <span className="icon-star-fill text-primary pe-1"></span>
              </div>
            </Form.Check.Label>
            <Form.Check.Input className="float-end" type="radio" name="rateRadio" id="rate4" defaultChecked={taskRating === 4 ? true : false} onChange={(e) => { SetTaskRating(2) }} />
          </Form.Check>
          <Form.Check className="m-0 form-check-sm py-4 px-0">
            <Form.Check.Label htmlFor="rate5" className="m-0 pe-7 dark-1 ">Incomplete work delivery
              <div className="star-rate mt-1">
                <span className="icon-star-fill text-primary pe-1"></span>
              </div>
            </Form.Check.Label>
            <Form.Check.Input className="float-end" type="radio" name="rateRadio" id="rate5" defaultChecked={taskRating === 5 ? true : false} onChange={(e) => { SetTaskRating(1) }} />
          </Form.Check>
          <Form.Group className="mt-4">
            <Form.Label className="dark-1">Please provide any comments or suggestions.</Form.Label>
            <Form.Control as="textarea" rows={2} ref={taskReviewInput} />
          </Form.Group>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-dark" size="md" onClick={ratingModalClose}>Close</Button>
        <Button disabled={processForRating} variant="primary" size="md" type="submit" onClick={() => { handleSaveRatingReview() }}>
          {
            !processForRating && 'Save'
          }
          {
            processForRating && <><Spinner size="sm" animation="border" className="me-1" />Save</>
          }
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(RatingReviewModal)