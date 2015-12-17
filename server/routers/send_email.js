var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'mixcollective.sys@gmail.com',
        pass: '53ucmz2bddias01'
    }
});

function send_email(to, subject, body, successFn, errorFn) {
    var to = to.join(',');
    var mailOptions = {
        from: 'mixcollective.sys@gmail.com', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: '', // plaintext body
        html: body // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            errorFn(error);
        } else {
            successFn(info);
        }
    });
}



module.exports = {
    sys_email: 'mixcollective.sys@gmail.com', 
    send_email: send_email
}