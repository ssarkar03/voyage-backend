var AWS = require("aws-sdk");
const PDFDocument = require("pdfkit");
require("dotenv").config();
const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const s3 = new AWS.S3({
  // apiVersion: '2006-03-01',
  // signatureVersion: 'v2',
  // process.env.
  region: process.env.region,
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
});

function uploadToS3Data(s3params) {
  return new Promise((resolve, reject) => {
    s3.upload(s3params, (err, resp) => {
      console.log("first");
      if (err) {
        reject(err);
        console.log("err===>", err);
      } else {
        resolve(resp);
        console.log(`File uploaded successfully. ${resp.Location}`);
      }
    });
  });
}

function sendEmail(doc,email) {
  console.log("abc====>", email);

    return new Promise((resolve,reject)=>{
      const result = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "noreply@cryptomouseee.com",
              Name: "innow8",
            },
            To: [
              {
                Email: email,
                Name: "shyam",
              },
            ],
            Subject: "Your Travel Itnery",
            TextPart: "",
            HTMLPart: `<h3>Hello here is your Travel itnery, <a href="${doc}">click me</a> to download<br> Have Nice Trip</h3>`,
          },
        ],
      });
      result
          .then((res)=>{
            resolve(res.body)
            console.log("result===>",res.body);
          })
          .catch((err)=>{
            reject(err)
            console.log("eroor3--==>",err);
          })
    })
  //  result
  //     .then((res) => {
  //       console.log("result===>",res.body);
  //     })
  //     .catch((err) => {
  //       console.log("eroor3--==>",err);
  //     });
  
}

async function buildPDF(res, email) {
  console.log("buildpdf",res.data);
  let data = res.data.choices[0].text;

  try {
    let doc = new PDFDocument({ margin: 20, size: "A4" });
    doc.fontSize(25).text("Your Itinery", 0, 60, { align: "center" });
    doc.moveDown();

    doc.image("./itlay.png", 0, 100, {
      width: 600,
      height: 200,
    });
    doc.fontSize(16);
    doc.moveDown();
    doc.text(`${data}`, 30, 300, {
      width: 500,
      align: "left",
    });

    doc.end();

    let filename = `${Date.now()}.pdf`;

    var s3params = {
      Bucket: "itinery-pdf",
      Key: filename,
      Body: doc,
      // ACL: 'public-write',
      // contentType : 'application/pdf'
    };

    const d = await uploadToS3Data(s3params);

    console.log(`File uploaded successfully`, d.Location);
    const result = await sendEmail(d.Location,email);
    console.log("await result===>", result);
  } catch (err) {
    console.log("err2==>", err);
  }
}


module.exports = { buildPDF };
