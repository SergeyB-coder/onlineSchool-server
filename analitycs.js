
function calculateResTest(answers, connection, callback) {
    const id = Object.keys(answers)[0]
    const sql = `
        SELECT topic_id
        FROM answer 
        INNER JOIN (
            SELECT topic.id as topic_id, question.id as question_id
            FROM question
            INNER JOIN topic ON topic.id=question.topic_id
        ) as topics ON topics.question_id=answer.question_id
        WHERE answer.id=${id}
    `
    connection.query(sql, [], function(err, results) {
        if(err) console.log(err);
        else 
        {
            const topic_id = results[0].topic_id
            console.log('topic_id', topic_id)
            const sql1_params = [topic_id];
            const sql1 = `
                SELECT answer.id as answer_id, answer.is_true as is_true, question.id as question_id 
                FROM answer
                INNER JOIN question ON question.id=answer.question_id
                WHERE question.topic_id=?`;
            connection.query(sql1, sql1_params, function(err, results) {
                if(err) console.log(err);
                else 
                {
                    let temp_dic = {}
                    for (let i=0; i<results.length; i++) {
                        if (results[i].question_id in temp_dic) {
                            temp_dic[results[i].question_id] = temp_dic[results[i].question_id] && (results[i].is_true == (results[i].answer_id in answers))
                        }
                        else {
                            temp_dic[results[i].question_id] = results[i].is_true == (results[i].answer_id in answers)
                        }
                    }
                    console.log('temp_dic', temp_dic)

                    let all_questions = 0
                    let true_questions = 0
                    for (let k in temp_dic) {
                        all_questions += 1
                        true_questions += 1 * temp_dic[k]
                    }
                    
                    return callback({all: all_questions, is_true: true_questions})
                }
            });
        }
    })
}


function verifyUserTopic(connection, user_id, topic_id, callback) {
    const sql = `
        SELECT * 
        FROM user_answer 
        INNER JOIN answer_checked ON answer_checked.user_answer_id=user_answer.id
        INNER JOIN answer ON answer.id=answer_checked.answer_id
        INNER JOIN question ON question.id=answer.question_id
        WHERE user_answer.user_id=${user_id} AND question.topic_id=${topic_id}
    `
    connection.query(sql, [], function(err, results) {
        if(err) console.log(err);
        else 
        {       
            return callback({res: results.length === 0})
        }
    })
}


module.exports = {
    calculateResTest,
    verifyUserTopic
}