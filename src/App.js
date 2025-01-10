import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { convertNumberToWords } from "./utils";
import "./App.css";

const filterImageMap = {
  Contentstack: "contentstack.png",
  Surfboard: "surfboard.png",
  RawEngineering: "raw.png",
};

const initialValues = {
  filter: "",
  voucherNo: "",
  date: new Date().toISOString().split("T")[0], // Set default date to today
  payTo: "",
  accountHead: "",
  account: "",
  amount: "",
  amountRs: "",
  checkedBy: "",
  approvedBy: "",
  receiverSignature: "",
};

const VoucherForm = () => {
  const [formData, setFormData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const url =
    process.env.REACT_APP_API_URL || "https://voucher-form-server.onrender.com";

  useEffect(() => {
    const fetchVoucherNo = async (filter) => {
      if (filter) {
        try {
          setLoading(true);
          const response = await axios.get(
            `${url}/get-voucher-no?filter=${filter}`
          );
          setFormData((prevData) => ({
            ...prevData,
            voucherNo: response.data.voucherNo,
          }));
        } catch (error) {
          console.error("Error fetching voucher number:", error);
          toast.error("Failed to fetch voucher number");
        } finally {
          setLoading(false);
        }
      }
    };

    if (formData.filter) {
      fetchVoucherNo(formData.filter);
    }
  }, [formData.filter, url]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const convertAmountToWords = () => {
    const amount = parseFloat(formData.amount);
    if (!isNaN(amount)) {
      const amountWords = convertNumberToWords(amount);
      setFormData((prevData) => ({
        ...prevData,
        amountRs: amountWords,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        amountRs: "",
      }));
    }
  };

  useEffect(() => {
    convertAmountToWords();
  }, [formData.amount]);

  const handleVoiceInput = (input) => {
    const amountMatch = input.match(/\u20b9?(\d+(,\d{3})*(\.\d{2})?)/);
    const payToMatch = input.match(/to ([A-Za-z\s]+)/);
    const dateMatch = input.match(/on (\d{1,2}(st|nd|rd|th)? [A-Za-z]+)/);
    const filterMatch = input.match(/for (Contentstack|Surfboard|RawEngineering)/);

    setFormData((prevData) => ({
      ...prevData,
      payTo: payToMatch ? payToMatch[1].trim() : prevData.payTo,
      amount: amountMatch ? amountMatch[1].replace(/,/g, "") : prevData.amount,
      date: dateMatch ? new Date(dateMatch[1]).toISOString().slice(0, 10) : prevData.date,
      filter: filterMatch ? filterMatch[1] : prevData.filter,
    }));
  };

  const handleVoiceStart = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleVoiceStop = () => {
    SpeechRecognition.stopListening();
    handleVoiceInput(transcript);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      const response = await axios.post(`${url}/submit`, formData);

      if (response.status === 200) {
        toast.success("Data submitted successfully and PDF uploaded!");
        setFormData(initialValues);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit data");
    } finally {
      setFormLoading(false);
    }
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <span>Your browser doesn't support speech recognition.</span>;
  }

  return (
    <>
      <ToastContainer />
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div className="voucher-container">
          <h2>Voucher Form</h2>
          <button onClick={handleVoiceStart}>Start Voice Input</button>
          <button onClick={handleVoiceStop}>Stop Voice Input</button>
          {listening && <p>Listening...</p>}
          <p>Transcript: {transcript}</p>

          <form id="voucherForm" onSubmit={handleSubmit}>
            <div className="wrapper">
              <div className="form-group">
                <label htmlFor="filter">Select Company</label>
                <select
                  id="filter"
                  name="filter"
                  value={formData.filter}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Options</option>
                  <option value="Contentstack">Contentstack</option>
                  <option value="Surfboard">Surfboard</option>
                  <option value="RawEngineering">Raw Engineering</option>
                </select>
                <div id="filterImageContainer">
                  <img
                    id="filterImage"
                    src={
                      formData.filter
                        ? `/${filterImageMap[formData.filter]}`
                        : ""
                    }
                    alt={formData.filter ? formData.filter : "Placeholder"}
                    style={{ display: formData.filter ? "block" : "none" }}
                  />
                </div>
              </div>
              <div className="voucher-info">
                <div className="form-group">
                  <label htmlFor="voucher-no">Voucher No.</label>
                  <input
                    type="text"
                    id="voucher-no"
                    name="voucherNo"
                    value={formData.voucherNo}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="payTo">Pay To</label>
              <input
                type="text"
                id="payTo"
                name="payTo"
                value={formData.payTo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="accountHead">Account Head</label>
              <input
                type="text"
                id="accountHead"
                name="accountHead"
                value={formData.accountHead}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="account">Towards the Account</label>
              <input
                type="text"
                id="account"
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount Rs.</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="amount-input"
                placeholder="amount in numbers"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="amount-details">
              <label htmlFor="amountRs">The Sum</label>
              <div className="amount-inputs">
                <input
                  type="text"
                  id="amountRs"
                  name="amountRs"
                  value={formData.amountRs}
                  placeholder="amount in words"
                  readOnly
                />
              </div>
            </div>
            <div className="signatures">
              <div className="signature">
                <label htmlFor="checkedBy">Checked By</label>
                <input
                  type="text"
                  id="checkedBy"
                  name="checkedBy"
                  value={formData.checkedBy}
                  onChange={handleChange}
                />
              </div>
              <div className="signature">
                <label htmlFor="approvedBy">Approved By</label>
                <input
                  type="text"
                  id="approvedBy"
                  name="approvedBy"
                  value={formData.approvedBy}
                  onChange={handleChange}
                />
              </div>
              <div className="signature">
                <label htmlFor="receiverSignature">Receiver Signature</label>
                <input
                  type="text"
                  id="receiverSignature"
                  name="receiverSignature"
                  value={formData.receiverSignature}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group m0">
              <button
                type="submit"
                className="submit-button"
                disabled={formLoading}
              >
                {formLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default VoucherForm;
