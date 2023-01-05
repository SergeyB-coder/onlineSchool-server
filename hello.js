const analitycs = require('./analitycs');
const fs = require('fs');
const path = require('path');
var nodemailer = require('nodemailer');
var md5 = require('md5');

const { APP_PORT, APP_IP, APP_PATH } = process.env;

const multer  = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/static/uploads');
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
const upload = multer({ storage: storage });
const bodyParser = require('body-parser');


const express = require('express')
var cors = require('cors')
const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var http = require('http').createServer(app);
const hostname = '127.0.0.1';
const port = 5000;
http.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);

    console.log(md5('123'))
});
// app.listen(APP_PORT, APP_IP, () => {
//   console.log(`Example app listening on port ${APP_PORT}`)
// })


const mysql = require("mysql");
  
// const connection = mysql.createConnection({
//   socketPath: "/var/run/mysqld/mysqld.sock",
//   user: "c64012_g8test_na4u_ru",
//   password: "RoWciNumsucek22",
//   database: "c64012_g8test_na4u_ru"
// });

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "school",
    password: ""
});



connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
 });
 
 var transporter = nodemailer.createTransport({
    // host: 'smtp.jino.ru',
    host: 'localhost',
    port: 25,
    // port: 587,
    // secure: false,
    // auth: {
        // user: 'NOREPLY@домстрахование.рф',
    // //   pass: 'tim16432%SRG9202'
        // pass: 'Teg67Hfg>%fhj',
    // },
    tls: {
        rejectUnauthorized: false
    }
});
 
app.post('/login', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let email = req.body.email
    let password = req.body.password
    const sql_params = [email];
    const sql = `SELECT user.id as id, password, admin.user_id as user_id 
                 FROM user 
                 LEFT JOIN admin ON user.id=admin.user_id 
                 WHERE email = ?`;
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("login select res ", results);
            if (results.length == 1) {   
            	if (results[0].password === password) {
	            	res.send({'res': true, 'user_id': results[0].id, 'is_adm': results[0].user_id || false })
            	}
            	else {
            		res.send({'res': false})
            	}
            }
            else {
            	res.send({'res': false})
            }
        }
    });
})

app.post('/reg', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let email = req.body.email
    const sql_params_user = [email]
    const sql_user = 'SELECT * FROM user WHERE email=?'
    connection.query(sql_user, sql_params_user, function(err, results) {
        if(err) console.log(err);
        else 
        {
            if (results.length == 1) { 
            	res.send({'res': false, 'message': 'Пользователь с таким email уже зарегестрирован'})
            }
            else {
                const password = Math.random().toString(36).slice(2)
                const sql_params = [email, password]
            	const sql = "INSERT INTO user (email, password) VALUES(?, ?)";
                connection.query(sql, sql_params, function(err, results) {
                    if(err) console.log(err);
                    else 
                    {
                        console.log("Данные добавлены", results);
                        var mailOptions = {
                                from: 'g8@edu.ru',
                                to: email,
                                subject: 'Добрый день!',
                                text: 'Вы зарегестрированы в системе тестирования Гимназии №8, ваш пароль: ' + password,
                            };
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                            console.log(error);
                            } else {
                            console.log('Email from sale sent: ' + info.response);
                            }
                        });   
                        res.send({'res': true, 'id': results.insertId})
                    }
                });
            }
        }
    });
})

app.post('/subjects', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    const sql_params = [];
    const sql = "SELECT * FROM subject";
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("subjects select res ", results);
            res.send({'res': true, 'subjects': results})
        }
    });
})

app.post('/deletesubject', upload.single('avatar'), function (req, res, next) {
    const subject_id = req.body.subject_id
    const sql_params = [subject_id];
    const sql = "DELETE FROM subject WHERE id=?";
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("subjects del res ", results);
            res.send({'res': true})
        }
    });
})


app.post('/newsubject', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let name = req.body.name
    const sql_params = [name];
    const sql = "INSERT INTO subject (name) VALUES(?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true, 'id': results.insertId})
            }
        });
})

app.post('/topics', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let class_id = req.body.class_id
    const sql_params = [class_id];
    const sql = "SELECT * FROM topic WHERE class_id=?";
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("topics select res ", results);
            res.send({'res': true, 'topics': results})
        }
    });
})

app.post('/newtopic', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let name = req.body.name
    let class_id = req.body.class_id
    const sql_params = [name, class_id];
    const sql = "INSERT INTO topic (name, class_id) VALUES(?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true, 'id': results.insertId})
            }
        });
})

app.post('/classes', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let subject_id = req.body.subject_id
    const sql_params = [subject_id];
    const sql = "SELECT * FROM class WHERE subject_id=?";
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("classes select res ", results);
            res.send({'res': true, 'classes': results})
        }
    });
})

app.post('/newclass', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let name = req.body.name
    let subject_id = req.body.subject_id
    const sql_params = [name, subject_id];
    const sql = "INSERT INTO class (name, subject_id) VALUES(?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true, 'id': results.insertId})
            }
        });
})

app.post('/question', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let topic_id = req.body.topic_id
    const sql_params = [topic_id];
    const sql = `
        SELECT answer.id as answer_id, answer.text as answer, answer.is_true as is_true, question.text as question, question.id as question_id 
        FROM answer
        INNER JOIN question ON question.id=answer.question_id
        WHERE question.topic_id=?`;
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            let questions_d = {}
            console.log("answers select res ", results);
            for (let i=0; i<results.length; i++) {
                if (results[i].question_id in questions_d) {
                    questions_d[results[i].question_id]['answers'].push({'id': results[i].answer_id, 'text': results[i].answer, 'is_true': results[i].is_true})
                }
                else {
                    questions_d[results[i].question_id] = {
                        'question_id': results[i].question_id, 
                        'question': results[i].question, 
                        'answers': [{'id': results[i].answer_id, 'text': results[i].answer, 'is_true': results[i].is_true}]
                        
                    }
                }
            }
            let questions = []
            for (k in questions_d) {
                questions.push(questions_d[k])
            }
            
            res.send({'res': true, 'questions': questions})
        }
    });
})


app.post('/newquestion', upload.single('avatar'), function (req, res, next) {
    console.log('body_newquestion', req.body)
    let topic_id = req.body.topic_id
    let text = req.body.text
    let answers = req.body.answers
    const sql_params = [text, topic_id];
    const sql = `INSERT INTO question (text, topic_id) VALUES(?, ?)`;
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            let question_id =  results.insertId
            let sql_answer = `INSERT INTO answer (text, question_id, is_true) VALUES `
            for (let i=0; i<answers.length; i++) {
                sql_answer += `("${answers[i].text}", ${question_id}, ${answers[i].is_true})`
                if (i<answers.length-1) {sql_answer += ', '}
            }
            connection.query(sql_answer, [], function(err, results) {
                if(err) console.log(err);
                else 
                {
                    
                    res.send({'res': true})
                }
            })
        }
    });
})


app.post('/sendtest', upload.single('avatar'), function (req, res, next) {
    console.log('body_sendtest', req.body)
    let user_id = req.body.user_id
    let datetime = req.body.datetime
    let answers = req.body.answers
    const sql_params = [user_id, datetime];
    const sql = `INSERT INTO user_answer (user_id, datetime) VALUES(?, ?)`;
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            let user_answer_id =  results.insertId
            let sql_answer = `INSERT INTO answer_checked (user_answer_id, answer_id) VALUES `
            for (let id in answers) {
                if (answers[id] === true) {
                  sql_answer += `(${user_answer_id}, ${id}), `  
                }
            }
            sql_answer = sql_answer.slice(0, -2)
            connection.query(sql_answer, [], function(err, results) {
                if(err) console.log(err);
                else 
                {
                    analitycs.calculateResTest(answers, connection, function(data) {
                        res.send({'res': data}) 
                    })
                }
            })
        }
    });
})


app.post('/verifyusertopic', upload.single('avatar'), function (req, res, next) {
    console.log('body_verifyusertopic', req.body)
    let user_id = req.body.user_id
    let topic_id = req.body.topic_id
    analitycs.verifyUserTopic(connection, user_id, topic_id, function(data) {
        res.send({'res': data.res})
    })
})