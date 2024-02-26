// Di dalam helper
const getLeaveApprovalEmailTemplate = (header, emailData, formattedStartDate, formattedEndDate) => {
  return `
    <html>
      <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f7f7f7;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #007bff;
              color: #fff;
              text-align: center;
              padding: 20px 0;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 20px;
            }
            .content p {
              margin: 10px 0;
            }
            .credentials {
              padding: 10px 20px;
              border-radius: 4px;
              text-align: start;
              margin: 0 auto;
            }
            .credentials strong {
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${header}</h1>
            </div>
            <div class="content">
              <p>Dear ${emailData.employeeName},</p>
              <p>Your leave request has been approved. Below are the details:</p>
              <table class="credentials">
                <tr>
                  <td><strong>Reason</strong></td>
                  <td><strong>:</strong></td>
                  <td>${emailData.reason}</td>
                </tr> 
                <tr>
                  <td><strong>Start Date</strong></td>
                  <td><strong>:</strong></td>
                  <td>${formattedStartDate}</td>
                </tr>
                <tr>
                  <td><strong>End Date</strong></td>
                  <td><strong>:</strong></td>
                  <td>${formattedEndDate}</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              <p>
                Best regards, <br />
                ${emailData.sendBy}
              </p>
            </div>
          </div>
        </body>
      </html>
  `;
};

const getLeaveRequestEmailTempalte = (
  leaveEmailData,
  formattedStartDate,
  formattedEndDate,
  emplooyeData,
) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #007bff;
            color: #fff;
            text-align: center;
            padding: 20px 0;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
          }
          .content p {
            margin: 10px 0;
          }
          .credentials {
            padding: 10px 20px;
            border-radius: 4px;
            text-align: start;
            margin: 0 auto;
          }
          .credentials strong {
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Leave Request Information</h1>
          </div>
          <div class="content">
            <p>This is to inform you that a leave request has been submitted for the following period:</p>
            <table class="credentials">
            <tr>
                <td><strong>Reason</strong></td>
                <td><strong>:</strong></td>
                <td>${leaveEmailData.reason}</td>
              </tr> 
            <tr>
                <td><strong>From</strong></td>
                <td><strong>:</strong></td>
                <td>${formattedStartDate}</td>
              </tr>
              <tr>
                <td><strong>Until</strong></td>
                <td><strong>:</strong></td>
                <td>${formattedEndDate}</td>
              </tr>
            </table>
          </div>
          <div class="footer">
            <p>
              Best regards, <br />
              ${emplooyeData.name}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};
const leaveRejectEmailTemplate = (header, emailData, formattedStartDate, formattedEndDate) => `
<html>
  <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #ff0000;
          color: #fff;
          text-align: center;
          padding: 20px 0;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
        }
        .content p {
          margin: 10px 0;
        }
        .credentials {
          padding: 10px 20px;
          border-radius: 4px;
          text-align: start;
          margin: 0 auto;
        }
        .credentials strong {
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${header}</h1>
        </div>
        <div class="content">
          <p>Dear ${emailData.employeeName},</p>
          <p>We regret to inform you that your leave request has been rejected. Below are the details:</p>
          <table class="credentials">
            <tr>
              <td><strong>Reason</strong></td>
              <td><strong>:</strong></td>
              <td>${emailData.reason}</td>
            </tr> 
            <tr>
              <td><strong>Start Date</strong></td>
              <td><strong>:</strong></td>
              <td>${formattedStartDate}</td>
            </tr>
            <tr>
              <td><strong>End Date</strong></td>
              <td><strong>:</strong></td>
              <td>${formattedEndDate}</td>
            </tr>
            <tr>
              <td><strong>Rejection Reason</strong></td>
              <td><strong>:</strong></td>
              <td>${emailData.note}</td>
            </tr>
          </table>
        </div>
        <div class="footer">
          <p>
            Best regards, <br />
            ${emailData.rejectBy}
          </p>
        </div>
      </div>
    </body>
  </html>`;

module.exports = {
  getLeaveApprovalEmailTemplate,
  getLeaveRequestEmailTempalte,
  leaveRejectEmailTemplate,
};
