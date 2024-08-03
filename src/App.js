import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const filterImageMap = {
  Contentstack: 'contentstack.png',
  Surfboard: 'surfboard.png',
  RawEngineering: 'raw.png',
};

const VoucherForm = () => {
  const [formData, setFormData] = useState({
    filter: '',
    voucherNo: '',
    date: '',
    payTo: '',
    accountHead: '',
    paidBy: '',
    account: '',
    amount: '',
    amountRs: '',
    preparedBy: '',
    checkedBy: '',
    approvedBy: '',
    receiverSignature: '',
  });
  useEffect(() => {
    const fetchVoucherNo = async (filter) => {
      if (filter) {
        try {
          const response = await axios.get(`${url}/get-voucher-no?filter=${filter}`);
          setFormData((prevData) => ({
            ...prevData,
            voucherNo: response.data.voucherNo,
          }));
        } catch (error) {
          console.error('Error fetching voucher number:', error);
        }
      }
    };

    fetchVoucherNo(formData.filter);
  }, [formData.filter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const convertNumberToWords = (num) => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = [
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
    ];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const scales = ['', 'thousand', 'million', 'billion', 'trillion'];

    if (num === 0) return 'zero';
    if (num < 0) return 'negative numbers are not supported';

    const chunks = [];
    while (num > 0) {
      chunks.push(num % 1000);
      num = Math.floor(num / 1000);
    }

    const convertChunk = (n) => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' ' + convertChunk(n % 100) : '');
    };

    const words = chunks.map((chunk, index) => {
      if (chunk === 0) return '';
      const chunkWords = convertChunk(chunk);
      return chunkWords + (index > 0 ? ' ' + scales[index] : '');
    });

    return words.reverse().join(' ').trim();
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
        amountRs: '',
      }));
    }
  };

  useEffect(() => {
    convertAmountToWords();
  }, [formData.amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${url}/submit`, formData);

      if (response.status === 200) {
        toast.success('Data submitted successfully and PDF uploaded!');
        console.log(`Sheet URL: ${response.data.sheetURL}`);
        console.log(`PDF File ID: ${response.data.pdfFileId}`);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data');
    }
  };

  return (
    <div className="voucher-container">
      <ToastContainer />
      <div className="form-group">
        <label htmlFor="filter">Filter:</label>
        <select id="filter" name="filter" value={formData.filter} onChange={handleChange} required>
          <option value="">Select Filter</option>
          <option value="Contentstack">Contentstack</option>
          <option value="Surfboard">Surfboard</option>
          <option value="RawEngineering">Raw Engineering</option>
        </select>
      </div>
      <div id="filterImageContainer">
        <img
          id="filterImage"
          src={formData.filter ? `/${filterImageMap[formData.filter]}` : ''}
          alt="Filter"
          style={{ display: formData.filter ? 'block' : 'none' }}
        />
      </div>
      <div className="voucher-info">
        <div className="form-group">
          <label htmlFor="voucher-no">Voucher No.</label>
          <input type="text" id="voucher-no" name="voucherNo" value={formData.voucherNo} readOnly />
        </div>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
      </div>
      <form id="voucherForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="payTo">Pay To</label>
          <input type="text" id="payTo" name="payTo" value={formData.payTo} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="accountHead">Account Head</label>
          <input type="text" id="accountHead" name="accountHead" value={formData.accountHead} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="paidBy">Paid By</label>
          <input type="text" id="paidBy" name="paidBy" value={formData.paidBy} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="account">Towards the Account</label>
          <input type="text" id="account" name="account" value={formData.account} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="amount">The sum of Rs.</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="amount-input"
            placeholder="Enter amount in numbers"
            required
          />
        </div>
        <div className="amount-details">
          <label htmlFor="amountRs">Amount</label>
          <div className="amount-inputs">
            <input
              type="text"
              id="amountRs"
              name="amountRs"
              value={formData.amountRs}
              placeholder="Show numbers in words"
              readOnly
            />
          </div>
        </div>
        <div className="signatures">
          <div className="signature">
            <label htmlFor="preparedBy">Prepared By</label>
            <input
              type="text"
              id="preparedBy"
              name="preparedBy"
              value={formData.preparedBy}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="signature">
            <label htmlFor="checkedBy">Checked By</label>
            <input
              type="text"
              id="checkedBy"
              name="checkedBy"
              value={formData.checkedBy}
              onChange={handleChange}
              placeholder="Enter your name"
              required
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
              placeholder="Enter your name"
              required
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
              placeholder="Enter your name"
              required
            />
          </div>
        </div>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default VoucherForm;
