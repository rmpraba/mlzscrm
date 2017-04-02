 var express    = require("express");
 var mysql      = require('mysql');
 var email   = require("emailjs/email");
 var connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : 'admin',
  database : 'mlzscrm'
 });

var bodyParser = require('body-parser');
var app = express();

app.use(express.static('app'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
   res.sendFile("app/index.html" );
});

app.post('/loginpage',  urlencodedParser,function (req, res)
{
  var user={"employee_id":req.query.username};
  var pass={"password":req.query.password};
  //console.log('hi');
  var loginarr=[];
  var rolearr=[];
  connection.query('SELECT (select short_name from md_school where id=e.school_id) as shortname,(select address from md_school where id=e.school_id) as address,(select name from md_school where id=e.school_id) as schoolname,e.school_id,e.employee_id, e.employee_name,e.role_id, r.role_name, a.rt_dashboard, a.rt_enquiry,a.rt_admission_form,a.rt_adm_approval, a.rt_followup, a.rt_collectionentry FROM md_employee as e JOIN md_role as r JOIN md_access_rights as a on r.role_id=e.role_id and a.role_id=e.role_id where ? and ?',[user,pass],
    function(err, rows){
    if(!err)
    {
    loginarr=rows;
    if(rows.length>0)
    {
      console.log('------------------------');
      console.log(rows[0].role_id);
      var rolequr="SELECT * FROM md_role_to_menu_submenu_mapping WHERE school_id='"+rows[0].school_id+"' and role_id='"+rows[0].role_id+"' order by menu_id";
      console.log(rolequr);
      connection.query(rolequr,
      function(err, rows){
      rolearr=rows;
      // console.log(JSON.stringify(rolearr));
      res.status(200).json({'loginarr': loginarr,'rolearr': rolearr});
      });
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
    console.log(err);
  }
});
});

app.post('/fetchgrade-service',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    connection.query('SELECT * FROM grade_master',
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
    }
    else{
     console.log(err);
    }
    });
});

app.post('/fetchacademicyear-service',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    connection.query('SELECT * FROM md_academic_year',
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
    }
    else{
     console.log(err);
    }
    });
});

app.post('/fetchadmissionyear-service',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    connection.query('SELECT * FROM md_admission_year',
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
    }
    else{
     console.log(err);
    }
    });
});


app.post('/fetchfeetype-service',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    connection.query('SELECT * FROM md_fee_type',
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
    }
    else{
     console.log(err);
    }
    });
});


app.post('/fetchdiscounttype-service',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    connection.query('SELECT * FROM md_discount_type',
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no type'});
    }
    }
    else{
     console.log(err);
    }
    });
});

app.post('/fetchfeecomponenttype-service',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    connection.query('SELECT * FROM md_fee_component',
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no type'});
    }
    }
    else{
     console.log(err);
    }
    });
});


app.post('/fetchfeecomponentinfo-service',  urlencodedParser,function (req, res){

var feequr="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and grade_id='"+req.query.grade+"'";

var discountqur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and grade_id='"+req.query.grade+"'";

var feeres={
"feecode":"",
"discountcode":""
};

connection.query(feequr,function(err, rows){
if(rows.length>0){
feeres.feecode=rows[0].fee_code;
if(req.query.discountstatus=="Yes")
{
  connection.query(discountqur,function(err, rows){
    if(rows.length>0){
      feeres.discountcode=rows[0].discount_code;
    }
  });
}
else{

}
}
else
res.status(200).json({'returnval': 'Fee Code Not Available!!'});
});
});


app.post('/fetchnoofinstallment-service',  urlencodedParser,function (req, res){

connection.query("SELECT * FROM md_total_installment",function(err, rows){
if(rows.length>0)
res.status(200).json({'returnval': rows[0].no_of_installment,'discount':rows[0].discount_percentage});
else
res.status(200).json({'returnval': '0'});
});
});


app.post('/fetchfeecodeseq-service',  urlencodedParser,function (req, res){
var response={"prefix":"","feecode":""};
connection.query("SELECT * FROM prefix_master WHERE prefix_id='"+req.query.prefixid+"'",function(err, rows){
  if(rows.length>0){
    response.prefix=rows[0].prefix_name;
  connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+req.query.schoolid+"'",function(err, rows){
    if(!err)
      res.status(200).json({'prefix': response.prefix,'sequence':rows[0].fee_sequence});
  });
  }
});

});


app.post('/fetchfeecodes-service',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"'";
    connection.query(qur,function(err, rows){
    if(!err)
      res.status(200).json({'returnval':rows});
  });
});

app.post('/generatefeecode-service',  urlencodedParser,function (req, res){

  connection.query("UPDATE fee_code_sequence SET fee_sequence='"+req.query.newseq+"' WHERE school_id='"+req.query.schoolid+"'",function(err, result){
    if(!err)
       res.status(200).json({'returnval': 'done'});
  });
  
});


app.post('/createfeecode-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade_id:req.query.grade,
      fee_code:req.query.feecode,
      fee_name:req.query.feename,
      fees:req.query.totalfees,
      created_by:req.query.createdby
    };

    var splitup={
      school_id:req.query.schoolid,
      fee_code:req.query.feecode,
      fee_type:req.query.feetype,
      fee_type_code:req.query.feetype,
      total_fee:req.query.totalfees,
      feetype_installment:req.query.feetypeinstallment,
      created_by:req.query.createdby
    };
    var splitcheck="SELECT * FROM fee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type='"+req.query.feetype+"'";
    var feemastercheck="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"'";

    connection.query(splitcheck,function(err, rows){
    if(rows.length==0){
    connection.query('INSERT INTO fee_splitup SET ?',[splitup],function(err, rows){
      connection.query(feemastercheck,function(err, rows){
        if(rows.length==0){
          connection.query('INSERT INTO fee_master SET ?',[response],function(err, rows){
            res.status(200).json({'returnval': 'created'});
          });
        }
        else{
            var fees = rows[0].fees;
            var newfees=parseInt(fees)+parseInt(req.query.totalfees);
            connection.query("UPDATE fee_master SET fees='"+newfees+"' WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"'",function(err, result){
            if(result.affectedRows==1)
            res.status(200).json({'returnval': 'updated'});
            else
            res.status(200).json({'returnval': 'not updated'});
            });
        }
      });
    });
    }
    else{
      var fee=rows[0].total_fee;
      // if(parseInt(fee)>=parseInt(req.query.totalfees))
      // var diff_fee=parseInt(fee)-parseInt(req.query.totalfees);
      // else
      var diff_fee=parseInt(req.query.totalfees)-parseInt(fee);
      connection.query("UPDATE fee_splitup SET total_fee='"+req.query.totalfees+"' WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type='"+req.query.feetype+"'",function(err, result){
        if(result.affectedRows==1){
      connection.query(feemastercheck,function(err, rows){
        if(rows.length==0){
          connection.query('INSERT INTO fee_master SET ?',[response],function(err, rows){
            res.status(200).json({'returnval': 'created'});
          });
        }
        else{
            var fees = rows[0].fees;
            console.log('.....................................');
            console.log(fees);
            console.log('.....................................');
            console.log(diff_fee);
            // if(parseInt(diff_fee)>0)
            var newfees=parseInt(fees)+parseInt(diff_fee);
            // else
            // var newfees=parseInt(fees)-parseInt(diff_fee);
            console.log('.....................................');
            console.log(newfees);
            connection.query("UPDATE fee_master SET fees='"+newfees+"' WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"'",function(err, result){
            if(result.affectedRows==1)
            res.status(200).json({'returnval': 'updated'});
            else
            res.status(200).json({'returnval': 'not updated'});
            });
        }
      });
        }
      });
    }
    });

});


app.post('/fetchrtefeecodeseq-service',  urlencodedParser,function (req, res){
var response={"prefix":"","feecode":""};
connection.query("SELECT * FROM prefix_master WHERE prefix_id='"+req.query.prefixid+"'",function(err, rows){
  if(rows.length>0){
    response.prefix=rows[0].prefix_name;
  connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+req.query.schoolid+"'",function(err, rows){
    if(!err)
      res.status(200).json({'prefix': response.prefix,'sequence':rows[0].fee_sequence});
  });
  }
});

});


app.post('/fetchrtefeecodes-service',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM rtefee_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"'";
    connection.query(qur,function(err, rows){
    if(!err)
      res.status(200).json({'returnval':rows});
  });
});

app.post('/generatertefeecode-service',  urlencodedParser,function (req, res){

  connection.query("UPDATE fee_code_sequence SET fee_sequence='"+req.query.newseq+"' WHERE school_id='"+req.query.schoolid+"'",function(err, result){
    if(!err)
       res.status(200).json({'returnval': 'done'});
  });
  
});


app.post('/creatertefeecode-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade_id:req.query.grade,
      fee_code:req.query.feecode,
      fee_name:req.query.feename,
      fees:req.query.totalfees,
      created_by:req.query.createdby
    };

    var splitup={
      school_id:req.query.schoolid,
      fee_code:req.query.feecode,
      fee_type:req.query.feetype,
      fee_type_code:req.query.feetype,
      total_fee:req.query.totalfees,
      feetype_installment:req.query.feetypeinstallment,
      created_by:req.query.createdby
    };
    var splitcheck="SELECT * FROM rtefee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type='"+req.query.feetype+"'";
    var feemastercheck="SELECT * FROM rtefee_master WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"'";

    connection.query(splitcheck,function(err, rows){
    if(rows.length==0){
    connection.query('INSERT INTO rtefee_splitup SET ?',[splitup],function(err, rows){
      connection.query(feemastercheck,function(err, rows){
        if(rows.length==0){
          connection.query('INSERT INTO rtefee_master SET ?',[response],function(err, rows){
            res.status(200).json({'returnval': 'created'});
          });
        }
        else{
            var fees = rows[0].fees;
            var newfees=parseInt(fees)+parseInt(req.query.totalfees);
            connection.query("UPDATE rtefee_master SET fees='"+newfees+"' WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"'",function(err, result){
            if(result.affectedRows==1)
            res.status(200).json({'returnval': 'updated'});
            else
            res.status(200).json({'returnval': 'not updated'});
            });
        }
      });
    });
    }
    else{
      var fee=rows[0].total_fee;
      // if(parseInt(fee)>=parseInt(req.query.totalfees))
      // var diff_fee=parseInt(fee)-parseInt(req.query.totalfees);
      // else
      var diff_fee=parseInt(req.query.totalfees)-parseInt(fee);
      connection.query("UPDATE rtefee_splitup SET total_fee='"+req.query.totalfees+"' WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type='"+req.query.feetype+"'",function(err, result){
        if(result.affectedRows==1){
      connection.query(feemastercheck,function(err, rows){
        if(rows.length==0){
          connection.query('INSERT INTO rtefee_master SET ?',[response],function(err, rows){
            res.status(200).json({'returnval': 'created'});
          });
        }
        else{
            var fees = rows[0].fees;
            console.log('.....................................');
            console.log(fees);
            console.log('.....................................');
            console.log(diff_fee);
            // if(parseInt(diff_fee)>0)
            var newfees=parseInt(fees)+parseInt(diff_fee);
            // else
            // var newfees=parseInt(fees)-parseInt(diff_fee);
            console.log('.....................................');
            console.log(newfees);
            connection.query("UPDATE rtefee_master SET fees='"+newfees+"' WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"'",function(err, result){
            if(result.affectedRows==1)
            res.status(200).json({'returnval': 'updated'});
            else
            res.status(200).json({'returnval': 'not updated'});
            });
        }
      });
        }
      });
    }
    });

});


app.post('/fetchdiscountcodeseq-service',  urlencodedParser,function (req, res){
var response={"prefix":"","feecode":""};
connection.query("SELECT * FROM prefix_master WHERE prefix_id='"+req.query.prefixid+"'",function(err, rows){
  if(rows.length>0){
    response.prefix=rows[0].prefix_name;
  connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+req.query.schoolid+"'",function(err, rows){
    if(!err)
      res.status(200).json({'prefix': response.prefix,'sequence':rows[0].discount_sequence});
  });
  }
});

});
app.post('/fetchdiscountcodes-service',  urlencodedParser,function (req, res){
    // if(req.query.studenttype=="All")
    // var checkqur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    // " and admission_year='"+req.query.admissionyear+"' and discount_type_code='"+req.query.discounttypecode+"' and mode='"+req.query.mode+"' and studenttype in('Promoted','New')"+
    // " and (from_date<='"+req.query.fromdate+"' and to_date>='"+req.query.fromdate+"') and fee_type='"+req.query.feetype+"'";
    // else
    var checkqur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and discount_type_code='"+req.query.discounttypecode+"' and mode='"+req.query.mode+"' and type='"+req.query.studenttype+"'"+
    " and (from_date<='"+req.query.fromdate+"' and to_date>='"+req.query.fromdate+"') and fee_type='"+req.query.feetype+"'";

    // var qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    // " and admission_year='"+req.query.admissionyear+"' and fee_type='"+req.query.feetype+"' and discount_type_code='"+req.query.discounttypecode+"' "+
    // " ";
   

    connection.query(checkqur,function(err, rows){
      if(!err)
          res.status(200).json({'returnval':rows});
    // if(rows.length==0){
    // connection.query(qur,function(err, rows){
    // if(rows.length==0){
    //   res.status(200).json({'returnval':rows});
    // }
    // });
    // }
    // else
    //   res.status(200).json({'returnval':'Already exist!!'});
    });

});


app.post('/generatediscountcode-service',  urlencodedParser,function (req, res){

  connection.query("UPDATE fee_code_sequence SET discount_sequence='"+req.query.newseq+"' WHERE school_id='"+req.query.schoolid+"'",function(err, result){
    if(!err)
       res.status(200).json({'returnval': 'done'});
  });
 
});


app.post('/creatediscountcode-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade,
      discount_code:req.query.discountcode,
      fee_type:req.query.feetype,
      discount_type_code:req.query.discounttypecode,
      discount_type:req.query.discounttype,
      // admission_type:req.query.admissiontype,
      from_date:req.query.fromdate,
      to_date:req.query.todate,
      created_by:req.query.createdby,
      amount:req.query.amount,
      discount_percentage:req.query.percentage,
      mode:req.query.mode,
      type:req.query.studenttype
    };

    console.log(response);

    var qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"' and discount_type_code='"+req.query.discounttypecode+"' and discount_type='"+req.query.discounttype+"' "+
    " and fee_type='"+req.query.feetype+"' and mode='"+req.query.mode+"' and (from_date<='"+req.query.fromdate+"' and to_date>='"+req.query.fromdate+"')";

    var updatequr="UPDATE md_discount_master SET amount='"+req.query.amount+"',from_date='"+req.query.fromdate+"',to_date='"+req.query.todate+"' WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"' and discount_type_code='"+req.query.discounttypecode+"' and discount_type='"+req.query.discounttype+"' "+
    " and fee_type='"+req.query.feetype+"' and mode='"+req.query.mode+"' and (from_date<='"+req.query.fromdate+"' and to_date>='"+req.query.fromdate+"')";

    console.log('-------------check--------------');

    console.log(qur);

    console.log('--------------------------------------');
    console.log('---------update---------------------');
    console.log(updatequr);

    connection.query(qur,function(err, rows){
      if(!err){
    if(rows.length==0){
    connection.query('INSERT INTO md_discount_master SET ?',[response],function(err, rows){
      if(!err)
     res.status(200).json({'returnval': 'created'});
    else{
      console.log(err);
      res.status(200).json({'returnval': 'not created'});
    }
    });
    }
    else{
    connection.query(updatequr,function(err, result){
     if(result.affectedRows>0)
     res.status(200).json({'returnval': 'updated'});
    else{
      console.log(err);
      res.status(200).json({'returnval': 'not updated'});
    }
    });
    }
  }
  else
    console.log(err);
    });

});

app.post('/generateinstallmentschedule-service',  urlencodedParser,function (req, res){
    var schoolid=req.query.schoolid;
    var prefixid=req.query.prefixid;
    var response={"prefixname":""};
    var qur="SELECT * FROM md_installment_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"' and no_of_installment='"+req.query.noofinstallment+"' "+
    " and schedulename='"+req.query.schedulename+"' and installment_pattern='"+req.query.installmentpattern+"' and no_of_installment='"+req.query.noofinstallment+"'";
    
    console.log('------------instllment master-------------');
    console.log(qur);
    console.log('------------------------------------------');

    connection.query(qur,function(err, rows){
    if(rows.length==0){
    connection.query("SELECT * FROM prefix_master WHERE prefix_id='"+prefixid+"'",function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      response.prefixname=rows[0].prefix_name;
      connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+schoolid+"'",function(err, rows){
        if(rows.length>0){
          var insschedulecode=response.prefixname+rows[0].insschedule_code;
          var new_seq=parseInt(rows[0].insschedule_code)+1;
          connection.query("UPDATE fee_code_sequence SET insschedule_code='"+new_seq+"' WHERE school_id='"+schoolid+"'",function(err, rows){
          if(!err)
          res.status(200).json({'returnval': insschedulecode});
          });
        }
        else{
          console.log(err);
          res.status(200).json({'returnval': 'seqfail'});
        }
      });
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'prefixfail'});
    }
  }
  else{
     console.log(err);
  }
  });
  }
  else
  {
    res.status(200).json({'returnval': rows[0].ins_schedule_code,'returnflag':'exist'});
    // connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+schoolid+"'",function(err, rows){
    //     if(rows.length>0){
    //       var feecode=response.prefixname+rows[0].fee_sequence;
    //       res.status(200).json({'returnval': feecode});
    //     }
    // });
  }
  });
});


app.post('/createinstallmentschedule-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade,
      no_of_installment:req.query.noofinstallment,
      admission_type:req.query.admissiontype,
      discount_type_code:req.query.discounttypecode,
      discount_type:req.query.discounttype,
      discount_code:req.query.discountcode,
      fee_code:req.query.feecode,
      fee_type:req.query.feetype,
      actual_amount:req.query.actualamount,
      discount_amount:req.query.discountamount,
      payable_amount:req.query.payableamount,
      ins_schedule_code:req.query.insschedulecode,
      created_by:req.query.createdby
    };

    console.log(response.no_of_installment);

    connection.query('INSERT INTO md_installment_master SET ?',[response],function(err, rows){
      if(!err)
      res.status(200).json({'returnval': 'created'});
      else{
      console.log(err);
      res.status(200).json({'returnval': 'not created'});
    }
    });

});



app.post('/generateinstallmentcode-service',  urlencodedParser,function (req, res){
    var schoolid=req.query.schoolid;
    var prefixid=req.query.prefixid;
    var response={"prefixname":""};
    var qur="SELECT * FROM installment_splitup WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"' and no_of_installment='"+req.query.noofinstallment+"' and installment_pattern='"+req.query.installmentpattern+"'";
    connection.query(qur,function(err, rows){
    if(rows.length==0){
    connection.query("SELECT * FROM prefix_master WHERE prefix_id='"+prefixid+"'",function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      response.prefixname=rows[0].prefix_name;
      connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+schoolid+"'",function(err, rows){
        if(rows.length>0){
          var installmentcode=response.prefixname+rows[0].installment_seq;
          var new_seq=parseInt(rows[0].installment_seq)+1;
          connection.query("UPDATE fee_code_sequence SET installment_seq='"+new_seq+"' WHERE school_id='"+schoolid+"'",function(err, rows){
          if(!err)
          res.status(200).json({'returnval': installmentcode});
          });
        }
        else{
          console.log(err);
          res.status(200).json({'returnval': 'seqfail'});
        }
      });
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'prefixfail'});
    }
  }
  else{
     console.log(err);
  }
  });
  }
  else
  {
    res.status(200).json({'returnval': rows[0].installment_code});
    // connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+schoolid+"'",function(err, rows){
    //     if(rows.length>0){
    //       var feecode=response.prefixname+rows[0].fee_sequence;
    //       res.status(200).json({'returnval': feecode});
    //     }
    // });
  }
  });
});


app.post('/createinstallment-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade,
      insschedule_code:req.query.installmentcode,
      no_of_installment:req.query.noofinstallment,
      installment:req.query.installment,
      installment_type:req.query.installmenttype,
      total_amount:req.query.actualamount,
      discount:req.query.discount,
      discount_type_code:req.query.discountcode,
      discount_type_name:req.query.discounttype,
      payable_amount:req.query.payableamount,
      installment_date:req.query.installmentdate,
      admission_type:req.query.admissiontype,
      created_by:req.query.createdby
    };

    // console.log(response);/

    connection.query('INSERT INTO installment_schedule_master SET ?',[response],function(err, rows){
      if(!err)
      res.status(200).json({'returnval': 'created'});
      else{
      console.log(err);
      res.status(200).json({'returnval': 'not created'});
    }
    });

});


app.post('/createinstallmentsplitup-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade,
      no_of_installment:req.query.noofinstallment,
      installment_pattern:req.query.installmentpattern,
      installment_code:req.query.installmentcode,
      installment:req.query.installment,
      installment_type:req.query.installmenttype,
      fee_type:req.query.feetype,
      total_amount:req.query.amount,
      created_by:req.query.createdby
    };

    connection.query('INSERT INTO installment_splitup SET ?',[response],function(err, rows){
      if(!err)
      res.status(200).json({'returnval': 'created'});
      else{
      console.log(err);
      res.status(200).json({'returnval': 'not created'});
    }
    });

});


app.post('/fetchinstallmentpattern-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade
    };
    var qur="SELECT * FROM installmenttype_master WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"'";
    connection.query(qur,function(err, rows){
      if(!err)
      res.status(200).json({'returnval': rows});
      else{
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
    });
});


app.post('/fetchinstallmentfeecode-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade,
      fee_type:req.query.feetype
    };
    var qur="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' and grade_id='"+req.query.grade+"'";
    // var qur1="SELECT * FROM fee_splitup WHERE fee_code='"++"'";
    connection.query(qur,function(err, rows){
      if(rows.length>0){
      connection.query("SELECT * FROM fee_splitup WHERE fee_code='"+rows[0].fee_code+"' and fee_type='"+req.query.feetype+"'",function(err, rows){
      if(!err)
      res.status(200).json({'returnval': rows});
      else{
      console.log(err);
      res.status(200).json({'returnval': '0'});
      }
    });
    }
    });
});


app.post('/fetchinstallmentdiscountcode-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade,
      fee_type:req.query.feetype
    };
    var qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' AND fee_type='"+req.query.feetype+"' AND discount_type_code='"+req.query.discountcode+"' AND admission_type='"+req.query.admissiontype+"' AND grade='"+req.query.grade+"'";
    console.log(qur);

    connection.query(qur,function(err, rows){
      if(!err)
      res.status(200).json({'returnval': rows});
      else{
      console.log(err);
      res.status(200).json({'returnval': '0'});
    }
    });
});


app.post('/fetchtotalinstallmentfeecode-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade
      // fee_type:req.query.feetype
    };
    var qur="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' and grade_id='"+req.query.grade+"'";
    // var qur1="SELECT * FROM fee_splitup WHERE fee_code='"++"'";
      connection.query(qur,function(err, rows){
      if(rows.length>0){
        response.totalfees=rows[0].fees;
      connection.query("SELECT * FROM fee_splitup WHERE fee_code='"+rows[0].fee_code+"'",function(err, rows){
      if(!err){       
      res.status(200).json({'returnval': rows,'totalfees':response.totalfees});
      }
      else{
      console.log(err);
      res.status(200).json({'returnval': '0'});
      }
    });
    }
    });
});


app.post('/fetchtotalinstallmentdiscountcode-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade

      // fee_type:req.query.feetype
    };
    var qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' AND discount_type_code='"+req.query.discountcode+"' AND admission_type='"+req.query.admissiontype+"' AND grade='"+req.query.grade+"'"+
    " and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"'";
    console.log(qur);

    connection.query(qur,function(err, rows){
      if(!err)
      res.status(200).json({'returnval': rows});
      else{
      console.log(err);
      res.status(200).json({'returnval': '0'});
    }
    });
});



app.post('/generateinstallmentschedulecode-service',  urlencodedParser,function (req, res){
    var schoolid=req.query.schoolid;
    var prefixid=req.query.prefixid;
    var response={"prefixname":""};
    var qur="SELECT * FROM installment_schedule_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"' and admission_type='"+req.query.admissiontype+"' and dicount_type_code='"+req.query.discountcode+"'";
    connection.query(qur,function(err, rows){
    if(rows.length==0){
    connection.query("SELECT * FROM prefix_master WHERE prefix_id='"+prefixid+"'",function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      response.prefixname=rows[0].prefix_name;
      connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+schoolid+"'",function(err, rows){
        if(rows.length>0){
          var insschedulecode=response.prefixname+rows[0].insschedule_code;
          var new_seq=parseInt(rows[0].insschedule_code)+1;
          connection.query("UPDATE fee_code_sequence SET insschedule_code='"+new_seq+"' WHERE school_id='"+schoolid+"'",function(err, rows){
          if(!err)
          res.status(200).json({'returnval': insschedulecode});
          });
        }
        else{
          console.log(err);
          res.status(200).json({'returnval': 'seqfail'});
        }
      });
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'prefixfail'});
    }
  }
  else{
     console.log(err);
  }
  });
  }
  else
  {
    res.status(200).json({'returnval': rows[0].insschedule_code,'returnflag':'exist'});
    // connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+schoolid+"'",function(err, rows){
    //     if(rows.length>0){
    //       var feecode=response.prefixname+rows[0].fee_sequence;
    //       res.status(200).json({'returnval': feecode});
    //     }
    // });
  }
  });
});


app.post('/createinstallmentschedulecode-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade,
      installment_code:req.query.installmentcode,
      fee_code:req.query.feecode,
      discount_code:req.query.discountcode,
      installment:req.query.installment,
      installment_type:req.query.installmenttype,
      fee_type:req.query.feetype,
      total_amount:req.query.totalamount,
      discount:req.query.discount,
      payable_amount:req.query.payableamount,
      installment_date:req.query.installmentdate,
      insschedule_code:req.query.insschedulecode,
      created_by:req.query.createdby
    };

    connection.query('INSERT INTO installment_schedule_master SET ?',[response],function(err, rows){
      if(!err)
      res.status(200).json({'returnval': 'created'});
      else{
      console.log(err);
      res.status(200).json({'returnval': 'not created'});
    }
    });

});



/*This function is used to submit the simple enquiry details of the student for the first time*/
app.post('/submitenquiry',  urlencodedParser,function (req, res)
{
  var collection={"enquiry_no":req.query.id,"school_id":req.query.schol,"academic_year":req.query.acadeyr,
  "class":req.query.grade,"father_mob":req.query.contact,"gender":req.query.gender,
  "first_name":req.query.firstname,"middle_name":req.query.middlename,"last_name":req.query.lastname,
  "dob":req.query.dobs,"father_name":req.query.father,"locality":req.query.location,"mother_name":req.query.mother,
  "father_email":req.query.email,"created_by":req.query.createdby,"created_on":req.query.createdate,
  "enquiry_name":req.query.givenname,"gemail":req.query.gemail,"gmob":req.query.gmob,"parent_or_guardian":req.query.paga,"Guardianname":req.query.Guardianname,"status":"Enquired","rte_student":req.query.rtestudent,"year_type":req.query.adtype,"discount_type_code":req.query.discounttype,"orginated_by":req.query.attendernamefn,"followed_by":req.query.attendernamefn,"enquiry_source":req.query.fnsource,"sibiling_name":req.query.sibilingname,"sibling_detail":req.query.sibilingdetail,"referrer_name":req.query.referrername};

       console.log(collection);
       connection.query('insert into student_enquiry_details set ? ',[collection],
        function(err, rows)
        {
    if(!err)
    {
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
});

/*It update the already entered student details with more information after the counselling using student name or enquiry number
*/
app.post('/updateenquiry',  urlencodedParser,function (req, res)
{
   var collection={"first_name":req.query.firstname,"middle_name":req.query.middlename,"last_name":req.query.lastname,
   "gender":req.query.gender,"class":req.query.grade,"dob":req.query.dob,"old_class":req.query.oldclass,
   "old_school":req.query.oldschool,"mother_tongue":req.query.mothertongue,"father_name":req.query.fathername,
   "mother_name":req.query.mothername,"father_qualification":req.query.fatheredu,"mother_qualification":req.query.motheredu,
   "father_mob":req.query.fathermob,"mother_mob":req.query.mothermob,"father_email":req.query.fathermail,
   "mother_email":req.query.mothermail,"father_company":req.query.fathercompany,"mother_company":req.query.mothercompany,
   "father_occupation":req.query.fatherjob,"mother_occupation":req.query.motherjobfn,"flat_no":req.query.flatno,
   "address1":req.query.address1,"address2":req.query.address2,"address3":req.query.address3,"city":req.query.city,
   "pincode":req.query.pincode,"state":req.query.statename,"enquiry_source":req.query.enquiysource,
   "sibiling_name":req.query.siblingname,"sibling_detail":req.query.siblingdetails,
   "transport_requirment":req.query.transportreq,"canteen_requirment":req.query.canteenreq,
   "second_language":req.query.secondlanguage,"third_language":req.query.thirdlanguage,"updated_by":req.query.modified,
   "prospectus_sold":req.query.prospectstatus,"father_designation":req.query.daddesignation,
   "mother_designation":req.query.momdesignation,"father_income":req.query.dadincome,"mother_income":req.query.momincome,
   "prospectus_no":req.query.prospectusno,"admission_test":req.query.admissiontest1,"admission_date":req.query.admissiondate1,
   'admission_test_english':req.query.admissiontestenglish1,"admission_test_maths":req.query.admissiontestmaths1,
   "admission_test_evs":req.query.admissiontestevs1,"Guardianname":req.query.guardianname1,"gmob":req.query.guardianmobile1,
   "gemail":req.query.guardianemail1,"guardian_company":req.query.guardiancompany1,"guardian_job":req.query.guardianjob1,
   "guardian_occup":req.query.guardianoccup1,"guardian_income":req.query.guardianincome1,"locality":req.query.location1,
   "mother_occupation_other":req.query.motherother,"father_occupation_other":req.query.motherother1,
   "guardian_occupation_other":req.query.guardianother1,"country_name":req.query.country_name1};


    var school={"school_id":req.query.schol};
    var enquiry={"enquiry_no":req.query.enq};

  console.log(req.query.momincome+" "+req.query.enq+" "+req.query.schol);
  console.log(collection);
       connection.query('update student_enquiry_details set ? where ? and ?',[collection,enquiry,school],
    function(err, rows)
    {
    if(!err)
    {
        console.log('inserted');
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });

 app.post('/registerenquiryform',  urlencodedParser,function (req, res)
 {
   var collection={"school_id":req.query.schol,"enquiry_no":req.query.enq,"first_name":req.query.firstname,
   "middle_name":req.query.middlename,"last_name":req.query.lastname,"gender":req.query.gender,
   "class":req.query.grade,"dob":req.query.dob,"old_class":req.query.oldclass,"old_school":req.query.oldschool,
   "mother_tongue":req.query.mothertongue,"father_name":req.query.fathername,"mother_name":req.query.mothername,
   "father_qualification":req.query.fatheredu,"mother_qualification":req.query.motheredu,"father_mob":req.query.fathermob,
   "mother_mob":req.query.mothermob,"father_email":req.query.fathermail,"mother_email":req.query.mothermail,
   "father_company":req.query.fathercompany,"mother_company":req.query.mothercompany,
   "father_occupation":req.query.fatherjob,"mother_occupation":req.query.motherjobfn,
   "flat_no":req.query.flatno,"address1":req.query.address1,"address2":req.query.address2,"address3":req.query.address3,
   "city":req.query.city,"pincode":req.query.pincode,"state":req.query.statename,"enquiry_source":req.query.enquiysource,
   "sibiling_name":req.query.siblingname,"sibling_detail":req.query.siblingdetails,
   "transport_requirment":req.query.transportreq,"canteen_requirment":req.query.canteenreq,
   "second_language":req.query.secondlanguage,"third_language":req.query.thirdlanguage,"updated_by":req.query.modified,
   "prospectus_sold":req.query.prospectstatus,"father_designation":req.query.daddesignation,
   "mother_designation":req.query.momdesignation,"father_income":req.query.dadincome,
   "mother_income":req.query.momincome,"prospectus_no":req.query.prospectusno,"academic_year":req.query.academicyear,
   "enquiry_name":req.query.givenname,"status":req.query.status,"admission_test":req.query.admissiontest,
   "admission_date":req.query.admissiondate,'admission_test_english':req.query.admissiontestenglish,
   "admission_test_maths":req.query.admissiontestmaths,"admission_test_evs":req.query.admissiontestevs,
   "Guardianname":req.query.guardianname,"gmob":req.query.guardianmobile,"gemail":req.query.guardianemail,
   "guardian_company":req.query.guardiancompany,"guardian_job":req.query.guardianjob,
   "guardian_occup":req.query.guardianoccup,"guardian_income":req.query.guardianincome,"locality":req.query.location,
   "mother_occupation_other":req.query.motherother,"father_occupation_other":req.query.fatherother,
   "year_type":req.query.enrolltype,"country_name":req.query.country_name,"orginated_by":req.query.attendername,"followed_by":req.query.attendername,"created_on":req.query.createdon};

   console.log('registerenquiry.............'+req.query.admissiontestevs+"  "+req.query.admissiontestenglish+"  "+req.query.admissiontestmaths);
   var school={"school_id":req.query.schol};
   var enquiry={"enquiry_no":req.query.enq};
   connection.query('insert into student_enquiry_details set ?',[collection],
     function(err, rows)
     {
       if(!err)
       {
         console.log('inserted2');
         res.status(200).json({'returnval': 'success'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }

     });
 });
/*this function is to get the total sequence number that has been created depending on the enquiry*/
app.post('/getenquiryno',  urlencodedParser,function (req, res)
{
  var id={"school_id":req.query.schol};

       connection.query('SELECT enquiry_no from sequence where ? ',[id],
        function(err, rows)
        {
    if(!err)
    {
    if(rows.length>0)
    {
//console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
  }
});
  });
/*this function is to fetch the available classes with repect to the school*/
app.post('/getclasses',  urlencodedParser,function (req, res)
{
  var id={"school_id":req.query.schol};

       connection.query('SELECT distinct class from class_details where ? ',[id],
        function(err, rows)
        {
    if(!err)
    {
    if(rows.length>0)
    {
//console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
  }
    else{
     console.log(err);
  }
});
  });


/*this function is to fetch the list of locations available with respect to school*/
app.post('/getlocation',  urlencodedParser,function (req, res)
{
  var id={"school_id":req.query.schol};

       connection.query('SELECT * from md_habitat where ? ',[id],
        function(err, rows)
        {
    if(!err)
    {
    if(rows.length>0)
    {
//console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
  }
  else{
     console.log(err);
  }
});
  });


/*this function is to fetch the name of student those who filled simple enquiry form and ready to fill the detailed enquiry form after counselling*/
app.post('/getstudentname',  urlencodedParser,function (req, res)
{
  var id={"school_id":req.query.schol};

       connection.query("SELECT * from student_enquiry_details where ? and pincode!=''",[id],
        function(err, rows)
        {
    if(!err)
    {
    if(rows.length>0)
    {
//console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
  }
    else{
     console.log(err);
  }
});
  });

/*this func is to update the sequence number only when the enquiry form is submitted*/
app.post('/updateenquirynum',  urlencodedParser,function (req, res)
{

  var school={"school_id":req.query.schol};
  var enquiry={"enquiry_no":req.query.id};

       connection.query('update sequence set ? where ? and ?',[enquiry,school],
        function(err, rows)
        {
    if(!err)
    {
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });

/*this function is used to update the sequence number only when the enquiry form is submitted*/
app.post('/updateseq',  urlencodedParser,function (req, res)
{
  var school={"school_id":req.query.schol};
  var enquiry={"enquiry_no":req.query.id};
       connection.query('update sequence set ? where ?',[enquiry,school],
        function(err, rows)
        {
    if(!err)
    {
      console.log('updated');
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });

 app.post('/add-event',  urlencodedParser,function (req, res){
   var event = {
     "title": req.query.title,
     "description": req.query.description,
     "start_date": req.startdate,
     "end_date": req.query.enddate,
     "event_type":req.query.event_type,
     "occurrence_frequency": req.query.frequency,
     "is_recurrence": req.query.is_recurrence,
     "occurrences": req.query.occurrance,
     "event_location": req.query.event_location,
     "status": "1"
   };
   connection.query('insert into new_event set ?',[event],
     function(err, rows){

       if(!err)
       {
         res.status(200).json({'returnval': 'success'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }
     });
 });

 /*this function is used to get the details of the particular enquiry using enquiry no*/
app.post('/getenqirydetails',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schol+"' and enquiry_no like '%"+req.query.enqno+"%' or enquiry_name like '%"+req.query.enqno+"%'";
  connection.query(qur,

        function(err, rows)
        {
    if(!err)
    {
    if(rows.length>0)
    {
//console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
    else{
     console.log(err);
  }
});
  });


/*this function is used to verify with the database whether the specific number is existing in database or not*/

app.post('/verifymobileno',  urlencodedParser,function (req, res)
{
  var qur = "SELECT * from student_enquiry_details where school_id='"+req.query.schol+"' and (father_mob='"+req.query.mobileno+"' or mother_mob='"+req.query.mobileno+"' or guardian_mobile='"+req.query.mobileno+"') ";
       connection.query(qur,
  function(err, rows)
        {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
  });

// Searching enquiry no for admission
app.post('/searchenquiry',  urlencodedParser,function (req, res){

    var qur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and (enquiry_no like '%"+req.query.enquiryno+"%' or enquiry_name like '%"+req.query.enquiryno+"%') and status='Enquired' ";

    var checkqur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and (enquiry_no like '%"+req.query.enquiryno+"%' or enquiry_name like '%"+req.query.enquiryno+"%') and status='Admitted'";
   console.log(qur);
   console.log(checkqur);
    connection.query(qur,function(err, rows){
      if(rows.length==0){
    connection.query(checkqur,function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': 'exist'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no enquiry'});
    }
     console.log(err);
    }
    });
      }
    else
    {
      res.status(200).json({'returnval': rows});
    }
    });
    // connection.query(checkqur,function(err, rows){
    //   if(rows.length==0){
    // connection.query(qur,function(err, rows)
    // {
    // if(!err)
    // {
    // if(rows.length>0)
    // {
    //   res.status(200).json({'returnval': rows});
    // }
    // else
    // {
    //   console.log(err);
    //   res.status(200).json({'returnval': 'no enquiry'});
    // }
    // }
    // else{
    //  console.log(err);
    // }
    // });
    //   }
    // else
    // {
    //   res.status(200).json({'returnval': 'exist'});
    // }
    // });
});


// Searching admission no of existing admission
app.post('/searchexistingadmission',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and admission_no like '%"+req.query.admissionno+"%' or student_name like '%"+req.query.admissionno+"%' or enquiry_no like '%"+req.query.admissionno+"%'";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no enquiry'});
    }
  }
  else{
     console.log(err);
  }
});
});


// Searching admitted student info for fee payment
app.post('/searchfeeadmission',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and admission_no like '%"+req.query.admissionno+"%' or student_name like '%"+req.query.admissionno+"%' or enquiry_no like '%"+req.query.admissionno+"%'";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});

// Searching admitted student info for fee payment
app.post('/checkdefaulterstatus-service',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and class_for_admission='"+req.query.grade+"' and admission_no='"+req.query.admissionno+"'";
    console.log('---------------------defaulter--------------');
    console.log(qur);
    connection.query(qur,function(err, rows){
    if(!err)
    {
    if(rows.length>0)
    {
       res.status(200).json({'returnval': rows[0].active_status});
    }
    else{
       res.status(200).json({'returnval': 'no rows'});
    }
    }
});
});



// Searching admitted student info for fee payment
app.post('/checkregfeepaidstatus-service',  urlencodedParser,function (req, res){
    var qur1="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
    " and admission_year='"+req.query.admissionyear+"' and grade_id=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"')";

    var qur2="";
    var qur3="";
    console.log(qur1);
    connection.query(qur1,function(err, rows){
    if(!err)
    {
    if(rows.length>0)
    {
      connection.query("SELECT * FROM fee_splitup WHERE fee_code='"+rows[0].fee_code+"' and school_id='"+req.query.schoolid+"' and fee_type='Registration fee'",function(err, rows){
        if(rows.length>0){
          connection.query("SELECT * FROM md_student_paidfee WHERE fee_code='"+rows[0].fee_code+"' and school_id='"+req.query.schoolid+"' and installment='Registration fee' and admission_no='"+req.query.admissionno+"' and paid_status in('inprogress','cleared','paid','waiveoff')",function(err, rows){
            if(rows.length>0){
              res.status(200).json({'returnval': 'paid'});
            }
            else{
              res.status(200).json({'returnval': 'not paid'});
            }
          });
        }
        else
        {
          res.status(200).json({'returnval': 'no regfee'});
        }
      });
      // res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no feecode'});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching enquiry no for admission
app.post('/fetchenquiryinfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and enquiry_no = '"+req.query.enquiryno+"' and status='Enquired' ";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching admission paid info
app.post('/fetchexistingadmissionpaidinfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and (admission_no = '"+req.query.admissionno+"' or enquiry_no='"+req.query.admissionno+"') and installment not in ('Registration fee','Application fee') and cheque_status not in ('cancelled')";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching admission paid info
app.post('/fetchexistingprovisionpaidinfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and (admission_no = '"+req.query.admissionno+"' or enquiry_no='"+req.query.admissionno+"') and installment in ('Commitment Fee (Ins1)')";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching admission info
app.post('/fetchexistingadmissioninfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and (admission_no = '"+req.query.admissionno+"' or enquiry_no='"+req.query.admissionno+"')";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});

// Fetching admission stud info
app.post('/fetchexistingadmissionstudinfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_student WHERE school_id='"+req.query.schoolid+"' and enquiry_no = '"+req.query.admissionno+"'";
  //  console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});

// Fetching admission acheivement info
app.post('/fetchexistingadmissioncoinfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_student_cocurricular_details WHERE school_id='"+req.query.schoolid+"' and enquiry_no = '"+req.query.admissionno+"'";
  //  console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});

// Fetching admission stud info
app.post('/fetchexistingadmissionphysicinfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_disability_student_details WHERE school_id='"+req.query.schoolid+"' and enquiry_no = '"+req.query.admissionno+"'";
  //  console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});

// Fetching admission stud school history info
app.post('/fetchexistingadmissionhistoryinfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_student_school_history WHERE school_id='"+req.query.schoolid+"' and enquiry_no = '"+req.query.admissionno+"'";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});

// Fetching admission proof info
app.post('/fetchexistingadmissionproof',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM mp_student_proof WHERE school_id='"+req.query.schoolid+"' and enquiry_no = '"+req.query.admissionno+"'";
    var allqur="SELECT * FROM md_proof";
    console.log('------------------------------');
   console.log(qur);
   console.log(allqur);
  var all=[];
  connection.query(allqur,function(err, rows)
    {
    if(!err)
    {
      all=rows;
    connection.query(qur,function(err, rows)
    {
    if(!err)
    {
    
      res.status(200).json({'proof':all,'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  });
  }
  });
});


// Insert Admission
app.post('/insertadmission',  urlencodedParser,function (req, res){

    var response={
        enquiry_no: req.query.enquiryno,
        admission_no: "",
        // prospect_application_no:req.query.applicationno,
        school_id:req.query.schoolid,
        school_name:req.query.schoolname,
        academic_year:req.query.academicyear,
        first_name:req.query.firstname,
        middle_name:req.query.middlename,
        last_name:req.query.lastname,
        student_name:req.query.studentname,
        class_for_admission:req.query.gradeselection,
        dob:req.query.admissiondob,
        gender:req.query.admissiongender,
        disabled_student:req.query.admissiondisabled,
        academic_acheivement:req.query.acheivehandler,
        canteen_availed:req.query.admissioncanteen,
        transport_availed:req.query.admissiontransport,
        created_By:req.query.createdby,
        father_name:req.query.fathername,
        mother_name:req.query.mothername,
        admission_year:req.query.admissionyear,
        // admission_type:req.query.admissiontype,
        discount_type:req.query.discounttype,
        previous_history:req.query.admissionhistory,
        having_sibling:req.query.admissionsibling,
        admission_status:'New',
        active_status:'Admitted',
        referral_type:req.query.referraltype,
        age:req.query.age
    }

    var qur="SELECT * FROM auto_admission_no";
   // console.log(qur);
    connection.query(qur,function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      response.admission_no="ENR"+rows[0].Admission_No;
      new_admission_no=parseInt(rows[0].Admission_No)+1;
      var status="";
      console.log('------------------------mdadmission-----------------------');
      console.log(req.query.discounttype);
      console.log('----------------------------------------------------------');
      if(req.query.discounttype=='7')
      status='Provision';
      else
      status='Admitted';
      
      connection.query("SELECT * FROM md_admission WHERE enquiry_no='"+req.query.enquiryno+"'",function(err, rows){
        if(rows.length==0){
      connection.query("INSERT INTO md_admission SET ?",[response],function(err, rows){
       if(!err){
        connection.query("UPDATE auto_admission_no SET Admission_No='"+new_admission_no+"'",function(err, result){
          if(result.affectedRows>0){
            connection.query("UPDATE student_enquiry_details SET admitted_date='"+req.query.admissiondate+"',status='"+status+"' where enquiry_no='"+req.query.enquiryno+"'",function(err, result){
              if(result.affectedRows>0){
              connection.query("UPDATE md_student SET admission_no='"+response.admission_no+"' where enquiry_no='"+req.query.enquiryno+"'",function(err, result){
              if(result.affectedRows>0){
              res.status(200).json({'returnval': response.admission_no});
              }
              });
              }
              else
              res.status(200).json({'returnval': 'admissionfail'});
            });
          }
        else
        res.status(200).json({'returnval': 'updatefail'});

      });
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'insertfail'});
    }

   });
    }
    else{
      connection.query("UPDATE md_admission SET ? WHERE enquiry_no='"+req.query.enquiryno+"'",[response],function(err, result){
        if(result.affectedRows>0){
          connection.query("UPDATE student_enquiry_details SET status='"+status+"' where enquiry_no='"+req.query.enquiryno+"'",function(err, result){
              if(result.affectedRows>0){
              // res.status(200).json({'returnval': response.admission_no});
              res.status(200).json({'returnval': 'Updated!'});
              }
              else
              res.status(200).json({'returnval': 'Not Updated!'});
            });
        }
        // res.status(200).json({'returnval': 'Updated!'});
        else
        res.status(200).json({'returnval': 'Not Updated!'});
      });
    }
    });
    }
    else
      res.status(200).json({'returnval': 'noadmissionno'});
  }
  });
});

app.post('/studentphysical_service',  urlencodedParser,function (req, res){
   var event = {

     "enquiry_no":req.query.enquiryno,
     // "prospect_application_no":req.query.applicationno,
     "school_id":req.query.schoolid,
     "academic_year":req.query.academicyear,
     "first_name":req.query.firstname,
     "middle_name":req.query.middlename,
     "last_name":req.query.lastname,
     "student_name":req.query.studentname,
     "class_for_admission":req.query.gradeselection,
     "created_by":req.query.createdby,
     "physic_detail":req.query.physicdetail,
     "physic_status":req.query.physicstatus,
     "mental_detail":req.query.mentaldetail,
     "mental_status":req.query.mentalstatus,
     "illness_detail":req.query.illnessdetail,
     "illness_status":req.query.illnessstatus,
     "allergy_detail":req.query.allergydetail,
     "allergy_status":req.query.allergystatus,
     "chronic_detail":req.query.chronicdetail,
     "chronic_status":req.query.chronicstatus
   };
   connection.query("SELECT * FROM md_disability_student_details WHERE enquiry_no='"+req.query.enquiryno+"'",function(err, rows){
    if(rows.length==0){
   connection.query('insert into md_disability_student_details set ?',[event],
     function(err, rows){

       if(!err)
       {
         res.status(200).json({'returnval': 'Inserted!'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'Not Inserted!'});
       }
     });
   }
   else{
    connection.query("UPDATE md_disability_student_details set ? WHERE enquiry_no='"+req.query.enquiryno+"'",[event],
     function(err, rows){

       if(!err)
       {
         res.status(200).json({'returnval': 'Updated!'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'Not Updated!'});
       }
     });
   }
  });
 });


app.post('/studentfulldetails_service',  urlencodedParser,function (req, res){
   var event = {
   "enquiry_no":req.query.enquiryno,
   // "prospect_application_no":req.query.applicationno,
   "school_id":req.query.schoolid,
   "academic_year":req.query.academicyear,
   "first_name":req.query.firstname,
   "middle_name":req.query.middlename,
   "last_name":req.query.lastname,
   "student_name":req.query.studentname,
   "class_for_admission":req.query.gradeselection,
   "dob":req.query.admissiondob,
   "gender":req.query.admissiongender,
   "age":req.query.age,
   "second_language":req.query.secondlanguage,
   "third_language":req.query.thirdlanguage,
   "created_by":req.query.createdby,
   "flat_no":req.query.flatno,
   "building_name":req.query.bulidingname,
   "street":req.query.street,
   "town":req.query.town,
   "city":req.query.city,
   "state":req.query.state,
   "pincode":req.query.pincode,
   "height":req.query.height,
   "weight":req.query.weight,
   "nationality":req.query.nationality,
   "mother_toungue":req.query.mothertongue,
   "sibling_name":req.query.siblingname,
   "sibling_class":req.query.siblingclass,
   "father_name":req.query.fathername,
   "mother_name":req.query.mothername,
   "father_dob":req.query.fatherdob,
   "mother_dob":req.query.motherdob,
   "father_profession":req.query.fatherqualification,
   "mother_profession":req.query.motherqualification,
   "father_occupation":req.query.fatheroccupation,
   "mother_occupation":req.query.motheroccupation,
   "father_income":req.query.fatherincome,
   "mother_income":req.query.motherincome,
   "father_tel":req.query.fathertelno,
   "mother_tel":req.query.mothertelno,
   "father_mobile":req.query.fathermobile,
   "mother_mobile":req.query.mothermobile,
   "father_email":req.query.fatheremail,
   "mother_email":req.query.motheremail,
   "permanent_pflatno":req.query.pflatno,
   "permanent_pbuildingname":req.query.pbuildingname,
   "permanent_pstreet":req.query.pstreet,
   "permanent_town":req.query.ptown,
   "permanent_district":req.query.pdistrict,
   "permanent_state":req.query.pstate,
   "permanent_pincode":req.query.ppincode,
   "guardian_relationship":req.query.relationship1,
   "guardian_name":req.query.guardianname1,
   "guard_flatno":req.query.gflatno,
   "guard_building":req.query.gbuildingname,
   "guard_street":req.query.gstreet,
   "guard_town":req.query.gtown,
   "guard_city":req.query.gcity,
   "guard_state":req.query.gstate,
   "guard_pincode":req.query.gpincode,
   "guard_res_contact":req.query.gresidentialcontact,
   "guard_office_contact":req.query.gofficecontact,
   "guard_mobile_no":req.query.gmobileno,
   "guard_fax":req.query.gfax,
   "caste":req.query.caste,
   "religion":req.query.religion,
   "aadhar_no":req.query.aadharno
 };
   connection.query("SELECT * FROM md_student WHERE enquiry_no='"+req.query.enquiryno+"'",function(err, rows){
   if(rows.length==0){
   connection.query('insert into md_student set ?',[event],function(err, rows){
       if(!err)
       {
         res.status(200).json({'returnval': 'Inserted!'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'Not Inserted!'});
       }
    });
    }
    else{
      connection.query("UPDATE md_student set ? WHERE enquiry_no='"+req.query.enquiryno+"'",[event],function(err, rows){
       if(!err)
       {
         res.status(200).json({'returnval': 'Updated!'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'Not Updated!'});
       }
       });
    }
 });
 });



app.post('/studentcocurricular_service',  urlencodedParser,function (req, res){
   var event = {
"enquiry_no":req.query.enquiryno,
// "prospect_application_no":req.query.applicationno,
"school_id":req.query.schoolid,
"academic_year":req.query.admissionyear,
"first_name":req.query.firstname,
"middle_name":req.query.middlename,
"last_name":req.query.lastname,
"student_name":req.query.studentname,
"class_for_admission":req.query.gradeselection,
"created_by":req.query.createdby,
"field1":req.query.field1,
"year1":req.query.year1,
"event1":req.query.event1,
"prize1":req.query.prizedetail1,
"field2":req.query.field2,
"year2":req.query.year2,
"event2":req.query.event2,
"prize2":req.query.prizedetail2,
"field3":req.query.field3,
"year3":req.query.year3,
"event3":req.query.event3,
"prize3":req.query.prizedetail3
   };
   connection.query("SELECT * FROM md_student_cocurricular_details WHERE enquiry_no='"+req.query.enquiryno+"'",function(err, rows){
    if(rows.length==0){
   connection.query('insert into md_student_cocurricular_details set ?',[event],
     function(err, rows){

       if(!err)
       {
         res.status(200).json({'returnval': 'Inserted!'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'Not Inserted!'});
       }
     });
      }
      else
      {
        connection.query("UPDATE md_student_cocurricular_details set ? WHERE enquiry_no='"+req.query.enquiryno+"'",[event],
     function(err, rows){

       if(!err)
       {
         res.status(200).json({'returnval': 'Updated!'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'Not Updated!'});
       }
     });
      }
   });
 });


app.post('/studenthistory_service', urlencodedParser,function (req, res){
   var event = {
    "enquiry_no":req.query.enquiryno,
    "school_id":req.query.schoolid,
    // "prospect_application_no":req.query.applicationno,
    "academic_year":req.query.admissionyear,
    "first_name":req.query.firstname,
    "middle_name":req.query.middlename,
    "last_name":req.query.lastname,
    "student_name":req.query.studentname,
    "class_for_admission":req.query.gradeselection,
    "created_by":req.query.createdby,
    "school_name":req.query.prevschoolname,
    // "prevschoolname":req.query.prevschoolname,
    "from_grade":req.query.classfrom,
    "to_grade":req.query.classto,
    "from_year":req.query.yearfrom,
    "to_year":req.query.yearto,
    "medium_of_ins":req.query.medium,
    "percentage":req.query.lastclassmark,
    "reason":req.query.reasonforleaving,
    "board":req.query.board

  };
  connection.query("SELECT * FROM md_student_school_history WHERE enquiry_no='"+req.query.enquiryno+"'",function(err, rows){
   if(rows.length==0){
   connection.query('insert into md_student_school_history set ?',[event],function(err, rows){

       if(!err)
       {
         res.status(200).json({'returnval': 'Inserted!'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'Not Inserted!'});
       }
     });
   }
   else
   {
    connection.query("UPDATE md_student_school_history set ? WHERE enquiry_no='"+req.query.enquiryno+"'",[event],function(err, rows){

       if(!err)
       {
         res.status(200).json({'returnval': 'Updated!'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'Not Updated!'});
       }
    });
   }
 });
 });



// Fetching enquiry no for admission
app.post('/searchfeeenquiry',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and enquiry_no = '"+req.query.enquiryno+"' or first_name='"+req.query.firstname+"'  and status in('Enquired','Admitted')";
    //console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching enquiry no for admission
app.post('/searchprospectenquiry',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and enquiry_no like '%"+req.query.enquiryno+"%' or first_name like '%"+req.query.firstname+"%'  and status in('Enquired','Admitted')";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching enquiry no for admission
app.post('/searchprospectenquiryinfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and enquiry_no = '"+req.query.enquiryno+"'";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching enquiry no for admission
app.post('/searchadmnenquiry',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and enquiry_no = '"+req.query.enquiryno+"' or first_name='"+req.query.firstname+"'";
  //  console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching enquiry no for admission
app.post('/searchadmission',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and admission_no = '"+req.query.admissionno+"' or first_name='"+req.query.firstname+"'";
    //console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching fees for admission
app.post('/fetchfees',  urlencodedParser,function (req, res){

    var response={"fee_code":"","total_fees":""};
    var qur="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' and admission_year = '"+req.query.admissionyear+"' and academic_year='"+req.query.academicyear+"' and grade_id=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"')";

    // var qur1="SELECT total_fee FROM fee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"++"'";
    console.log(qur);
    connection.query(qur,function(err, rows){
    if(!err)
    {
    if(rows.length>0)
    {
      response.fee_code=rows[0].fee_code;
      response.total_fees=rows[0].fees;
      var qur1="SELECT * FROM fee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"+response.fee_code+"' ";
      connection.query(qur1,function(err, rows){
        var result=[];
        var obj={"fee_code":"","fees":""};
        obj.fee_code=response.fee_code;
        var regfee=0;
        if(rows.length>0){
        for(var i=0;i<rows.length;i++)
        {
          if(rows[i].fee_type=='Registration fee')
            regfee=rows[i].total_fee;
        }  
        obj.fees=parseFloat(parseFloat(response.total_fees)-parseFloat(regfee)).toFixed(2);
        console.log('fees..............'+obj.fees);
        }
        // else{
        // obj.fees=parseFloat(response.total_fees).toFixed(2);
        // console.log('fees..............'+obj.fees);
        // }
        result.push(obj);
        if(result.length>0)
        res.status(200).json({'returnval': result,'feesplitup':rows});
      });
      // res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});


app.post('/fetchrtefees',  urlencodedParser,function (req, res){

    var response={"fee_code":"","total_fees":""};
    var qur="SELECT * FROM rtefee_master WHERE school_id='"+req.query.schoolid+"' and admission_year = '"+req.query.admissionyear+"' and academic_year='"+req.query.academicyear+"' and grade_id=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"')";

    // var qur1="SELECT total_fee FROM fee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"++"'";
    console.log(qur);
    connection.query(qur,function(err, rows){
    if(!err)
    {
    if(rows.length>0)
    {
      response.fee_code=rows[0].fee_code;
      response.total_fees=rows[0].fees;
      var qur1="SELECT * FROM rtefee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"+response.fee_code+"' ";
      connection.query(qur1,function(err, rows){
        var result=[];
        var obj={"fee_code":"","fees":""};
        obj.fee_code=response.fee_code;
        var regfee=0;
        if(rows.length>0){
        for(var i=0;i<rows.length;i++)
        {
          if(rows[i].fee_type=='Registration fee')
            regfee=rows[i].total_fee;
        }  
        obj.fees=parseFloat(parseFloat(response.total_fees)-parseFloat(regfee)).toFixed(2);
        console.log('fees..............'+obj.fees);
        }
        // else{
        // obj.fees=parseFloat(response.total_fees).toFixed(2);
        // console.log('fees..............'+obj.fees);
        // }
        result.push(obj);
        if(result.length>0)
        res.status(200).json({'returnval': result,'feesplitup':rows});
      });
      // res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});



app.post('/fetchdiscount-service',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schoolid,
      academic_year:req.query.academicyear,
      admission_year:req.query.admissionyear,
      grade:req.query.grade
      // fee_type:req.query.feetype
    };
    console.log('installmentpattern.......'+req.query.installmentpattern);
    var qur;
    if((req.query.installmentpattern=='3')||(req.query.installmentpattern=='4')){
    console.log('in');
    if(req.query.referraltype==""||req.query.referraltype==null)
    qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' AND mode='"+req.query.mode+"' and type in('All','"+req.query.studenttype+"') and academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' AND discount_type_code in ('"+req.query.discounttype+"','5') "+
    " AND grade=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"') "+
    " and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type not in ('Registration fee') ";
    else
    qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' AND mode='"+req.query.mode+"' and type in('All','"+req.query.studenttype+"') AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' AND discount_type_code in ('"+req.query.discounttype+"','5','"+req.query.referraltype+"') "+
    " AND grade=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"') "+
    " and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type not in ('Registration fee')";
    
    }
    else{
    console.log('out');
    if(req.query.referraltype==""||req.query.referraltype==null)
    qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' AND mode='"+req.query.mode+"' and type in('All','"+req.query.studenttype+"') AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' AND discount_type_code='"+req.query.discounttype+"' "+
    " AND grade=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"') "+
    " and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type not in ('Registration fee','Lumpsum')";
    else
    qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' AND mode='"+req.query.mode+"' and type in('All','"+req.query.studenttype+"') AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' AND discount_type_code in ('"+req.query.discounttype+"','"+req.query.referraltype+"')  "+
    " AND grade=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"') "+
    " and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type not in ('Registration fee','Lumpsum')";
    }
    console.log(qur);

    connection.query(qur,function(err, rows){
      if(!err)
      res.status(200).json({'returnval': rows});
      else{
      console.log(err);
      res.status(200).json({'returnval': '0'});
    }
    });
});

// Fetching fees info for admission
app.post('/fetchfeesinfo-service',  urlencodedParser,function (req, res){

    var qur="SELECT discount ,sum(payable_amount) as payableamount FROM installment_splitup WHERE school_id='"+req.query.schoolid+"' and admission_year = '"+req.query.admissionyear+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and discount_type_code='"+req.query.discounttype+"' and admission_type='"+req.query.admissiontype+"' and no_of_installment='"+req.query.noofinstallment+"' group by fee_type";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching fees splitup
app.post('/fetchfeesplitup',  urlencodedParser,function (req, res){

    // var qur="SELECT * FROM installment_schedule_master WHERE school_id='"+req.query.schoolid+"' and admission_year = '"+req.query.admissionyear+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and discount_type_code='"+req.query.discounttype+"' and admission_type='"+req.query.admissiontype+"' and no_of_installment='"+req.query.noofinstallment+"'";
    var qur="SELECT * FROM md_fee_splitup_master WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type not in ('Registration fee') order by base_fee_type";
    console.log(qur);

    // var qur="SELECT * FROM installment_schedule_master WHERE school_id='"+req.query.schoolid+"' and admission_year = '"+req.query.admissionyear+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and discount_type_code='"+req.query.discounttype+"' and admission_type='"+req.query.admissiontype+"' and no_of_installment='"+req.query.noofinstallment+"'";
   // console.log(qur);

    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching registeration fees info for admission
app.post('/fetchregfeesinfo-service',  urlencodedParser,function (req, res){

    var qur="SELECT * FROM fee_splitup WHERE fee_code='"+req.query.feecode+"' and school_id='"+req.query.schoolid+"' and fee_type='Registration fee'";
    console.log('-----------------fecth fee splitup------------------');
    console.log(qur);
    console.log('----------------------------------------------------');
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching registeration fees info for admission
app.post('/fetchregfeediscount-service',  urlencodedParser,function (req, res){

    var qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' and admission_year = '"+req.query.admissionyear+"' and academic_year='"+req.query.academicyear+"' and grade=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"') and discount_type_code='"+req.query.discounttype+"' and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type='Registration fee'";
   console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching admission paid info
app.post('/fetchexistingadmissionregpaidinfo',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and (admission_no = '"+req.query.admissionno+"' or enquiry_no='"+req.query.admissionno+"') and installment='"+req.query.feetype+"'";
  //  console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows'});
    }
  }
  else{
     console.log(err);
  }
});
});




// Fetching fees splitup
app.post('/fetchnoofinstallment',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM installment_master WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type='"+req.query.feetype+"'";
  //  console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching fees installment names
app.post('/fetchinstallmentseperation',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM installment_splitup WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"'";
   // console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


// Fetching fees splitup
app.post('/insertcashfees',  urlencodedParser,function (req, res){
    var qur="INSERT INTO tr_student_fees SET ?";
   // console.log(qur);
   // console.log(req.query.installment+" "+(req.query.installment).length);

    var response={
        school_id:req.query.schoolid,
        academic_year:req.query.academicyear,
        enquiry_no:req.query.enquiryno,
        admission_no:req.query.admissionno,
        student_name:req.query.studentname,
        grade:req.query.grade,
        fee_type:req.query.feetype,
        fee_code:req.query.feecode,
        installment_type:req.query.installmenttype,
        installment:req.query.installment,
        installment_date:req.query.installmentdate,
        // actual_amount:req.query.actualamount,
        // discount_amount:req.query.discountamount,
        installment_amount:req.query.installmentamount,
        waiveoff_amount:req.query.waiveoffamount,
        mode_of_payment:req.query.modeofpayment,
        receipt_date:req.query.receiptdate,
        paid_date:req.query.paiddate,
        paid_status:req.query.paidstatus,
        created_by:req.query.createdby,
        latefee_amount:req.query.latefee,
        fine_amount:req.query.fineamount,
        // payment_through:req.query.paymentthrough,
        receipt_no:""
    };

    var response1={
        school_id:req.query.schoolid,
        academic_year:req.query.academicyear,
        enquiry_no:req.query.enquiryno,
        admission_no:req.query.admissionno,
        student_name:req.query.studentname,
        grade:req.query.grade,
        waiveoff_amount:req.query.waiveoffamount,
        installment_date:req.query.installmentdate,
        fee_code:req.query.feecode,
        discount_code:req.query.discountcode,
        installment_type:req.query.installmenttype,
        installment:req.query.installment,
        mode_of_payment:req.query.modeofpayment,
        installment_amount:req.query.installmentamount,
        actual_amount:req.query.actualamount,
        discount_amount:req.query.discountamount,
        receipt_date:req.query.receiptdate,
        received_date:req.query.receiveddate,
        paid_date:req.query.paiddate,
        paid_status:req.query.paidstatus,
        cheque_status:req.query.paidstatus,
        created_by:req.query.createdby,
        fine_amount:req.query.fineamount,
        provision_payment:req.query.provisionflag,
        payment_through:req.query.paymentthrough,
        installment_pattern:req.query.installmentpattern,
        receipt_no:"",
        adhoc_discount:req.query.adhocdiscount,
        adhoc_feetype:req.query.adhocfeetype,
        adhoc_reason:req.query.adhocreason,
        admission_status:req.query.admissionstatus,
        difference_amount:0,
        paymenttype_flag:req.query.type,
        latefee_amount:req.query.latefee,
        latefee_date:req.query.receiveddate
    };


    var masterinsert="INSERT INTO md_student_paidfee SET ?";

    connection.query("SELECT * FROM receipt_sequence",function(err, rows){
    response.receipt_no="REC-"+response.academic_year+"-"+rows[0].receipt_seq;
    response1.receipt_no="REC-"+response.academic_year+"-"+rows[0].receipt_seq;
    var new_receipt_no=parseInt(rows[0].receipt_seq)+1;
    connection.query(masterinsert,[response1],function(err, rows){
    if(!err){
    connection.query(qur,[response],
    function(err, rows){
    if(!err)
    {
      if(req.query.feecashcount=='0'){
        console.log('in'+req.query.feecashcount);
      connection.query("UPDATE receipt_sequence SET receipt_seq='"+new_receipt_no+"'",function(err, result){
        if(result.affectedRows>0){
          if(req.query.installment=="Application fee")
          connection.query("UPDATE student_enquiry_details SET prospectus_status='yes' where school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.admissionno+"'",function(err, result){
          res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.receipt_no,'receiptdate':response1.receipt_date});
          });
          else
          res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.receipt_no,'receiptdate':response1.receipt_date});          
        }
        else
          res.status(200).json({'returnval': 'Seq not updated!'});
      });
      }
      else{
        console.log('out'+req.query.feecashcount);
        res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.receipt_no,'receiptdate':response1.receipt_date});
      }
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'Fee not paid'});
    }
    });
    }
    else
    console.log(err);
    });
    });
});

// Fetching fees splitup
app.post('/insertchequefees',  urlencodedParser,function (req, res){
    var qur="INSERT INTO tr_cheque_details SET ?";
   // console.log(qur);

    var response={
       school_id:req.query.schoolid,
       academic_year:req.query.academicyear,

        enquiry_no:req.query.enquiryno,
        admission_no:req.query.admissionno,

        student_name:req.query.studentname,
        grade:req.query.grade,
        fee_type:req.query.feetype,
        fee_code:req.query.feecode,
        installment_type:req.query.installmenttype,
        installment:req.query.installment,
        installment_date:req.query.installmentdate,
        installment_amount:req.query.installmentamount,
        waiveoff_amount:req.query.waiveoffamount,

        mode_of_payment:req.query.modeofpayment,
        received_date:req.query.receiveddate,
        paid_status:req.query.paidstatus,
        cheque_status:req.query.chequestatus,
        created_by:req.query.createdby,

        cheque_no:req.query.chequeno,
        bank_name:req.query.bankname,
        cheque_date:req.query.chequedate,
        latefee_amount:req.query.latefee,
        fine_amount:req.query.fineamount,
        ack_no:""
    };

    var response1={
        school_id:req.query.schoolid,
        academic_year:req.query.academicyear,
        enquiry_no:req.query.enquiryno,
        admission_no:req.query.admissionno,
        student_name:req.query.studentname,
        grade:req.query.grade,
        // fee_type:req.query.feetype,
        waiveoff_amount:req.query.waiveoffamount,
        installment_date:req.query.installmentdate,
        fee_code:req.query.feecode,
        discount_code:req.query.discountcode,
        installment_type:req.query.installmenttype,
        installment:req.query.installment,
        mode_of_payment:req.query.modeofpayment,
        cheque_no:req.query.chequeno,
        installment_amount:req.query.installmentamount,
        actual_amount:req.query.actualamount,
        discount_amount:req.query.discountamount,
        receipt_date:req.query.receiptdate,
        received_date:req.query.receiveddate,
        paid_date:req.query.receiveddate,
        paid_status:req.query.chequestatus,
        cheque_status:req.query.chequestatus,
        created_by:req.query.createdby,
        bank_name:req.query.bankname,
        fine_amount:req.query.fineamount,
        provision_payment:req.query.provisionflag,
        cheque_date:req.query.chequedate,
        payment_through:req.query.paymentthrough,
        installment_pattern:req.query.installmentpattern,
        receipt_no:"",
        adhoc_discount:req.query.adhocdiscount,
        adhoc_feetype:req.query.adhocfeetype,
        adhoc_reason:req.query.adhocreason,
        admission_status:req.query.admissionstatus,
        difference_amount:0,
        paymenttype_flag:req.query.type,
        latefee_amount:req.query.latefee,
        latefee_date:req.query.receiveddate
    };

    var masterinsert="INSERT INTO md_student_paidfee SET ?";
    var new_receipt_no="";
    var new_ack_no="";
    
    connection.query("SELECT * FROM receipt_sequence",function(err, rows){
    if((req.query.chequedate<=req.query.receiveddate)){
      response.ack_no="REC-"+response.academic_year+"-"+rows[0].receipt_seq;
      response1.receipt_no="REC-"+response.academic_year+"-"+rows[0].receipt_seq;
      new_ack_no=parseInt(rows[0].receipt_seq)+1;
    }
    else{
      response.ack_no="ACK-"+response.academic_year+"-"+rows[0].acknowledge_seq;
      response1.receipt_no="ACK-"+response.academic_year+"-"+rows[0].acknowledge_seq;
      new_ack_no=parseInt(rows[0].acknowledge_seq)+1;
    }
    connection.query(masterinsert,[response1],function(err, rows){
      if(!err){
    connection.query(qur,[response],function(err, rows){
    if(!err)
    {
      if(req.query.feechequecount=='0'){
      connection.query("UPDATE receipt_sequence SET acknowledge_seq='"+new_ack_no+"'",function(err, result){
        if(result.affectedRows>0){
          if(req.query.installment=="Application fee")
          connection.query("UPDATE student_enquiry_details SET prospectus_status='yes' where school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.admissionno+"'",function(err, result){
         
          res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.ack_no,'receiptdate':response1.receipt_date});
        });
        else
          res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.ack_no,'receiptdate':response1.receipt_date});
        }
        else
          res.status(200).json({'returnval': 'Seq not updated!'});
      });
      }
      else
          res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.ack_no,'receiptdate':response1.receipt_date});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'Fee not paid'});
    }
    });
    }
    else
    console.log(err);
    });
  });
});

// Fetching fees splitup
app.post('/inserttransferfees',  urlencodedParser,function (req, res){
    var qur="INSERT INTO tr_transfer_details SET ?";
    console.log(qur);

    var response={
       school_id:req.query.schoolid,
       academic_year:req.query.academicyear,
        enquiry_no:req.query.enquiryno,
        admission_no:req.query.admissionno,
        student_name:req.query.studentname,
        grade:req.query.grade,
        fee_type:req.query.feetype,
        fee_code:req.query.feecode,
        installment_type:req.query.installmenttype,
        installment:req.query.installment,
        installment_date:req.query.installmentdate,
        installment_amount:req.query.installmentamount,
        waiveoff_amount:req.query.waiveoffamount,

        mode_of_payment:req.query.modeofpayment,
        received_date:req.query.receiveddate,

        paid_date:req.query.paiddate,
        paid_status:req.query.paidstatus,
        reference_no:req.query.referenceno,
        bank_name:req.query.bankname,
        latefee_amount:req.query.latefee,
        fine_amount:req.query.fineamount,
        "receipt_no":""
    };

    var response1={
        school_id:req.query.schoolid,
        academic_year:req.query.academicyear,
        enquiry_no:req.query.enquiryno,
        admission_no:req.query.admissionno,
        student_name:req.query.studentname,
        grade:req.query.grade,
        // fee_type:req.query.feetype,
        waiveoff_amount:req.query.waiveoffamount,
        installment_date:req.query.installmentdate,
        fee_code:req.query.feecode,
        discount_code:req.query.discountcode,
        installment_type:req.query.installmenttype,
        installment:req.query.installment,
        mode_of_payment:req.query.modeofpayment,
        cheque_no:req.query.referenceno,
        installment_amount:req.query.installmentamount,
        actual_amount:req.query.actualamount,
        discount_amount:req.query.discountamount,
        receipt_date:req.query.receiptdate,
        received_date:req.query.receiveddate,
        paid_date:req.query.receiveddate,
        paid_status:req.query.paidstatus,
        cheque_status:req.query.paidstatus,
        created_by:req.query.createdby,
        bank_name:req.query.bankname,
        fine_amount:req.query.fineamount,
        provision_payment:req.query.provisionflag,
        payment_through:req.query.paymentthrough,
        installment_pattern:req.query.installmentpattern,
        receipt_no:"",
        adhoc_discount:req.query.adhocdiscount,
        adhoc_feetype:req.query.adhocfeetype,
        adhoc_reason:req.query.adhocreason,
        admission_status:req.query.admissionstatus,
        difference_amount:0,
        paymenttype_flag:req.query.type,
        cheque_date:req.query.chequedate,
        latefee_amount:req.query.latefee,
        latefee_date:req.query.receiveddate
    };

    var masterinsert="INSERT INTO md_student_paidfee SET ?";


    connection.query("SELECT * FROM receipt_sequence",function(err, rows){
    response.receipt_no="REC-"+response.academic_year+"-"+rows[0].transfer_seq;
    response1.receipt_no="REC-"+response.academic_year+"-"+rows[0].transfer_seq;
    var new_receipt_no=parseInt(rows[0].transfer_seq)+1;
    connection.query(masterinsert,[response1],function(err, rows){
    if(!err){
    connection.query(qur,[response],function(err, rows){
    if(!err)
    {
      if(req.query.feetransfercount=='0'){
      connection.query("UPDATE receipt_sequence SET transfer_seq='"+new_receipt_no+"'",function(err, result){
        if(result.affectedRows>0){
            if(req.query.installment=="Application fee")
          connection.query("UPDATE student_enquiry_details SET prospectus_status='yes' where school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.admissionno+"'",function(err, result){
         
          res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.receipt_no,'receiptdate':response1.receipt_date});
        });
        else
         res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.receipt_no,'receiptdate':response1.receipt_date}); 
        }
        else
          res.status(200).json({'returnval': 'Seq not updated!'});
      });
      }
      else
          res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.receipt_no,'receiptdate':response1.receipt_date});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'Fee not paid'});
    }
  });
  }
  else
    console.log(err);
  });
  });
});


// Fetching fees splitup
app.post('/insertthirdpartyfees',  urlencodedParser,function (req, res){
    var qur="INSERT INTO tr_thirdparty_details SET ?";
    console.log(qur);

    var response={
       school_id:req.query.schoolid,
       academic_year:req.query.academicyear,
        enquiry_no:req.query.enquiryno,
        admission_no:req.query.admissionno,
        student_name:req.query.studentname,
        grade:req.query.grade,
        fee_type:req.query.feetype,
        fee_code:req.query.feecode,
        installment_type:req.query.installmenttype,
        installment:req.query.installment,
        installment_date:req.query.installmentdate,
        installment_amount:req.query.installmentamount,
        waiveoff_amount:req.query.waiveoffamount,

        mode_of_payment:req.query.modeofpayment,
        received_date:req.query.receiveddate,

        paid_date:req.query.paiddate,
        paid_status:req.query.paidstatus,
        latefee_amount:req.query.latefee,
        fine_amount:req.query.fineamount,
        // reference_no:req.query.referenceno,
        // bank_name:req.query.bankname,
        "receipt_no":""
    };

    var response1={
        school_id:req.query.schoolid,
        academic_year:req.query.academicyear,
        enquiry_no:req.query.enquiryno,
        admission_no:req.query.admissionno,
        student_name:req.query.studentname,
        grade:req.query.grade,
        // fee_type:req.query.feetype,
        waiveoff_amount:req.query.waiveoffamount,
        installment_date:req.query.installmentdate,
        fee_code:req.query.feecode,
        discount_code:req.query.discountcode,
        installment_type:req.query.installmenttype,
        installment:req.query.installment,
        mode_of_payment:req.query.modeofpayment,
        // cheque_no:req.query.referenceno,
        installment_amount:req.query.installmentamount,
        actual_amount:req.query.actualamount,
        discount_amount:req.query.discountamount,
        receipt_date:req.query.receiptdate,
        received_date:req.query.paiddate,
        paid_date:req.query.paiddate,
        paid_status:req.query.paidstatus,
        cheque_status:req.query.paidstatus,
        created_by:req.query.createdby,
        // bank_name:req.query.bankname,
        fine_amount:req.query.fineamount,
        provision_payment:req.query.provisionflag,
        payment_through:req.query.paymentthrough,
        installment_pattern:req.query.installmentpattern,
        receipt_no:"",
        difference_amount:0,
        adhoc_discount:req.query.adhocdiscount,
        adhoc_feetype:req.query.adhocfeetype,
        adhoc_reason:req.query.adhocreason,
        admission_status:req.query.admissionstatus,
        difference_amount:0,
        paymenttype_flag:req.query.type,
        latefee_amount:req.query.latefee,
        latefee_date:req.query.receiveddate
    };

    var masterinsert="INSERT INTO md_student_paidfee SET ?";


    connection.query("SELECT * FROM receipt_sequence",function(err, rows){
    response.receipt_no="ACK-"+response.academic_year+"-"+rows[0].transfer_seq;
    response1.receipt_no="ACK-"+response.academic_year+"-"+rows[0].transfer_seq;
    var new_receipt_no=parseInt(rows[0].transfer_seq)+1;
    connection.query(masterinsert,[response1],function(err, rows){
    if(!err){
    connection.query(qur,[response],function(err, rows){
    if(!err)
    {
      if(req.query.feetransfercount=='0'){
      connection.query("UPDATE receipt_sequence SET transfer_seq='"+new_receipt_no+"'",function(err, result){
        if(result.affectedRows>0){
            if(req.query.installment=="Application fee")
          connection.query("UPDATE student_enquiry_details SET prospectus_status='yes' where school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.admissionno+"'",function(err, result){
         
          res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.receipt_no,'receiptdate':response1.receipt_date});
        });
        else
         res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.receipt_no,'receiptdate':response1.receipt_date}); 
        }
        else
          res.status(200).json({'returnval': 'Seq not updated!'});
      });
      }
      else
          res.status(200).json({'returnval': 'Fee paid!','info':response,'receiptno':response.receipt_no,'receiptdate':response1.receipt_date});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'Fee not paid'});
    }
  });
  }
  else
    console.log(err);
  });
  });
});


/*this ajax is used to take the sequence number from the table for prospectus number*/
app.post('/getprospectno',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    //console.log('qur');
    connection.query('SELECT prospectus_no FROM sequence WHERE ?',[qur],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
  });

/*the below function is used to update the prospectus sequence number in the table*/
app.post('/updateprospectno',  urlencodedParser,function (req, res)
{
  var school={"school_id":req.query.schol};
  var enquiry={"prospectus_no":req.query.id};
       connection.query('update sequence set ? where ?',[enquiry,school],
        function(err, rows)
        {
    if(!err)
    {
      console.log('updated');
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });

/*this function is to get the count of enquiry takes placed by grade wise*/
app.post('/getenquirycount',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    var state={"status":req.query.status};
    var acyear={"academic_year":req.query.academicyear};
    //console.log('qur');
    connection.query('SELECT status,class,count(*) as total FROM `student_enquiry_details` WHERE ? and ? and ? group by (class)',[qur,state,acyear],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
  });

/*this function is to get the count of enquiry takes placed by grade wise*/
app.post('/getadmittedcount',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    var state={"status":req.query.status};
    var acyear={"academic_year":req.query.academicyear};
    //console.log('qur');
    connection.query('SELECT *,class,count(*) as total FROM `student_enquiry_details` WHERE ? and ? and ? group by (class)',[qur,state,acyear],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});

/*this function is to get the count of admission cancellation takes placed by grade wise*/
app.post('/getcancelledcount',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    var state={"status":req.query.status};
    var acyear={"academic_year":req.query.academicyear};
    //console.log('qur');
    connection.query('SELECT *,class,count(*) as total FROM `student_enquiry_details` WHERE ? and ? and ? group by (class)',[qur,state,acyear],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});


/*this function insert the followup information in followup table*/
app.post('/updatefollow',  urlencodedParser,function (req, res) {
  var collection={"school_id":req.query.schol,"id":req.query.id,"enquiry_id":req.query.enquiryno,"schedule_no":req.query.schedule,"created_by":req.query.createdby,"created_on":req.query.createdon,"current_confidence_level":req.query.currconfidence,"schedule_status":req.query.schedulestatus,"schedule_flag":req.query.scheduleflag,"no_of_days":req.query.noofdays,"no_of_schedules":req.query.noofschedule,"last_schedule_date":req.query.lastscheduleon,"upcoming_date":req.query.upcomingdate,"followed_by":req.query.followername};
       connection.query('insert into followup set ? ',[collection],
        function(err, rows)
        {
    if(!err)
    {
      //console.log('inserted');
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });



/*this below function is used to insert data in the follow up detail table */
app.post('/updatefollowdetail',  urlencodedParser,function (req, res)
{
   var collection={"school_id":req.query.schol,"schedule_id":req.query.id,"enquiry_id":req.query.enquiryid,"followup_no":req.query.followupno,"schedule_date":req.query.followupdate,"next_followup_date":req.query.nextfolowup,"schedule":req.query.schedule,"followup_status":req.query.flag,"created_by":req.query.createdby,"created_on":req.query.createdon};
       connection.query('insert into followupdetail set ? ',[collection],
        function(err, rows)
        {
    if(!err)
    {
      //console.log('inserted');
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });

/*this function is used to get the referrer name from parent table*/
app.post('/getparentname',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    //console.log('qur');
    connection.query('SELECT parent_name, student_id FROM `parent` WHERE ?',[qur],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
  });


/*this function is used to get the referrer name from student detail table*/

app.post('/getstudentnamelist',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    console.log(qur);
    connection.query('SELECT id, student_name FROM `student_details` WHERE ?',[qur],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  } else {
     console.log(err);
  }
});
  });


/*this function is used to fetch the detail of students, who have been enrolled for the enquiry*/


app.post('/getfollowupcount',  urlencodedParser,function (req, res){

    //console.log('qur');
    connection.query("SELECT p.schedule_status, f.class, COUNT( * ) AS total FROM   student_enquiry_details AS f join followup as p WHERE p.`school_id` =  '"+req.query.schol+"' AND p.schedule_status=  '"+req.query.status+"' AND f.enquiry_no = p.enquiry_id and f.status='Enquired' GROUP BY class ORDER BY (`class`)",
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 0});
    }
  }
  else{
     console.log(err);
  }
});
});


 app.post('/getfollowupstudents',  urlencodedParser,function (req, res)
 {
   var school={"school_id":req.query.schol};
   var grade={"class":req.query.grade};
   var status={"status":req.query.status};

   var checkstatus=req.query.status;
   if((checkstatus=='Closed')||(checkstatus=='Exhausted')){
        var qur = "SELECT f.enquiry_id,f.schedule_flag,s.enquiry_name,f.schedule_status,f.id,f.current_confidence_level,f.upcoming_date FROM followup f join student_enquiry_details s on f.enquiry_id=s.enquiry_no WHERE f.schedule_status='"+req.query.fnstatus+"' and s.class='"+req.query.fngrade+"' and s.school_id = '"+req.query.schol+"' and f.followed_by='"+req.query.user+"' and s.status='Enquired' ORDER BY (upcoming_date) DESC";
   }
   else{
        var qur = "SELECT f.enquiry_id,f.schedule_flag,s.enquiry_name,f.schedule_status,f.id,f.current_confidence_level,f.upcoming_date FROM followup f join student_enquiry_details s on f.enquiry_id=s.enquiry_no WHERE f.schedule_status='"+req.query.fnstatus+"' and s.class='"+req.query.fngrade+"' and s.school_id = '"+req.query.schol+"' and f.followed_by='"+req.query.user+"' and s.status='Enquired'  ORDER BY (upcoming_date)";
   }
   console.log(qur);
   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         //console.log(rows);
         res.status(200).json({'returnval': rows});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }

     });
 });

app.post('/getenqdetails',  urlencodedParser,function (req, res)
{
  

   var qur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schol+"' and class='"+req.query.fngrade+"' and status='"+req.query.fnstatus+"'";
   console.log(qur);
   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         console.log(rows);
         res.status(200).json({'returnval': rows});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }

     });
 });








 app.post('/viewdetail',  urlencodedParser,function (req, res)
 {
   var school={"school_id":req.query.schol};
   var id={"enquiry_no":req.query.id};
   var qur = "select f.enquiry_id,f.current_confidence_level,f.id,f.schedule_no,f.last_schedule_date,f.schedule_Status,d.enquiry_no,d.enquiry_name,d.class,d.created_on,d.father_name,d.father_mob,d.guardian_mobile,d.guardian_name from followup as f Join student_enquiry_details d on d.enquiry_no=f.enquiry_id where f.id='"+req.query.fid+"' and f.enquiry_id='"+req.query.id+"' and f.school_id='"+req.query.schol+"' and f.schedule_status='"+req.query.fstatus+"'";
//console.log(qur);

   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         //console.log(rows);
         res.status(200).json({'returnval': rows});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }

     });
 });

/*this function is to get the count of admission takes placed by grade wise*/
app.post('/getadmissioncount',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    var state={"status":req.query.status};
    //console.log('qur');
    connection.query('SELECT *,class,count(*) as total FROM `student_enquiry_details` WHERE ? and ? group by (class)',[qur,state],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
});

 

 app.post('/fetchdetailedenquiryinfo', urlencodedParser,function (req, res){

   //console.log('qur');
   connection.query("SELECT * from student_enquiry_details where school_id = '"+req.query.schoolid+"' and enquiry_no= '"+req.query.enquiryno+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval': 0});
         }
       }
       else{
         console.log(err);
       }
     });
 });


 app.post('/fetchadmissiontestinfo', urlencodedParser,function (req, res){

   //console.log('qur');
   var qur="SELECT d.enquiry_no, d.enquiry_name, d.class, d.created_on, a.english_status, a.maths_status, a.evs_status, a.test_date,a.english_mark,a.maths_mark,a.evs_mark,a.result_status  FROM student_enquiry_details as d join admission_test_details as a WHERE (a.school_id='"+req.query.schoolid+"' and a.enquiry_id='"+req.query.enquiryno+"') and d.status='Enquired' and d.admission_test='Yes' and (d.enquiry_no='"+req.query.enquiryno+"' and d.school_id='"+req.query.schoolid+"')";
 //  console.log('...........admission test............'+qur);
   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }
       else{
         console.log(err);
       }
     });
 });


  app.post('/updateteststatus', urlencodedParser,function (req, res){

   //console.log('qur');
   var qur="UPDATE student_enquiry_details SET admission_status='"+req.query.status+"' WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.enquiryno+"' and status='Enquired' and admission_test='Yes'";
   var qur1="UPDATE admission_test_details SET english_mark='"+req.query.englishmark+"' , maths_mark='"+req.query.mathsmark+"' "+
            " , evs_mark='"+req.query.evsmark+"' , result_status='"+req.query.status+"' ,evaluated_by='"+req.query.evaluatedby+"' ,evaluated_on='"+req.query.evaluatedon+"' "+
            " WHERE school_id='"+req.query.schoolid+"' and enquiry_id='"+req.query.enquiryno+"' ";
  // console.log(qur);
 //  console.log(qur1);
   connection.query(qur,
     function(err, result)
     {
       if(!err)
       {
         if(result.affectedRows>0)
         {
           connection.query(qur1,function(err, result){
           if(result.affectedRows>0)
           res.status(200).json({'returnval': 'updated!'});
           else
           res.status(200).json({'returnval': 'not updated!'});
           });
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval': 'not updated!'});
         }
       }
       else{
         console.log(err);
       }
     });
 });

  

 app.post('/discountenq',  urlencodedParser,function (req, res){
   var response={
     "school_id":req.query.schol,
     "enquiry_no":req.query.enq,
     "discount_code":req.query.discountid,
   };
   connection.query('INSERT INTO special_discounts SET ?',[response],
     function(err, rows)
     {
       if(!err)
       {
         res.status(200).json({'returnval': 'success'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'no'});
       }
     });
 });


 app.post('/updatedate',  urlencodedParser,function (req, res)
 {
   var school={"school_id":req.query.schol};
   var enquiry={"enquiry_id":req.query.enqno};
   var followupid={"followup_id":req.query.fwupid};
   var collection = {"followup_flag":req.query.nextflag,"next_followup_date":req.query.nextdate};
  // console.log(collection);
   connection.query('update followupdetail set ? where ? and ?',[collection,school,followupid],
     function(err, rows)
     {
       if(!err)
       {
         console.log('inserted');
         res.status(200).json({'returnval': 'success'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }

     });
 });



/*app.post('/getconfidencecount',  urlencodedParser,function (req, res){

    //console.log('qur');
    connection.query("SELECT d.followup_status, f.class, COUNT( * ) AS total FROM  `followupdetail` AS d, student_enquiry_details AS f WHERE d.`school_id` =  '"+req.query.schol+"' AND d.current_confidence_level =  '"+req.query.status+"' AND f.enquiry_no = d.enquiry_id and f.status='Enquired' GROUP BY class ORDER BY (`class`)",
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 0});
    }
  }
  else{
     console.log(err);
  }
});
});*/



app.post('/verifyage',  urlencodedParser,function (req, res){

    //console.log('qur');
    var classes={"grade":req.query.grades};
    connection.query("SELECT * from md_age where ?",[classes],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
   //   console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 0});
    }
  }
  else{
     console.log(err);
  }
});
});

 app.post('/country',  urlencodedParser,function (req, res){
   connection.query("SELECT * from country_code",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

 app.post('/discount',  urlencodedParser,function (req, res){
   connection.query("SELECT * from md_discounts where id not in('1','5')",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

/*this below function is used to store the admission test details in the table names, admission_test_details*/

app.post('/admissiondetails',  urlencodedParser,function (req, res){

    var response={
      "school_id":req.query.schol,
      "enquiry_id":req.query.enqid,
      "english_status":req.query.english,
      "maths_status":req.query.maths,
      "evs_status":req.query.eve,
      "test_date":req.query.testdate,
      "updated_by":req.query.updateby,
      "updated_on":req.query.updateon
    };
    connection.query('INSERT INTO admission_test_details SET ?',[response],
    function(err, rows)
    {
    if(!err)
    {
      res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no'});
    }
    });
});


/*this function used to update the admission test mark details in the admission_test_details*/

app.post('/updatetestdetails', urlencodedParser,function (req, res){

   //console.log('qur');
   var qur="UPDATE admission_test_details SET english_mark='"+req.query.english+"', maths_mark='"+req.query.maths+"', evs_mark='"+req.query.evs+"', result_status='"+req.query.status+"', evaluated_by='"+req.query.evaluatedby+"', evaluated_on='"+req.query.evaluatedon+"' WHERE school_id='"+req.query.schoolid+"' and enquiry_id='"+req.query.enquiryno+"'";
  // console.log(qur);
   connection.query(qur,
     function(err, result)
     {
       if(!err)
       {

           res.status(200).json({'returnval': 'success'});
        }
        else
        {
           console.log(err);
           res.status(200).json({'returnval': 'not updated!'});
        }

     });
 });


 app.post('/rtenumber',  urlencodedParser,function (req, res){

   var collection = {"school_id":req.query.schol,"enquiry_no":req.query.enq,"rte_no":req.query.rte_num};
   connection.query("INSERT into rte_students set ? ",[collection],
     function(err, rows){
       if(!err)
       {
         res.status(200).json({'returnval': 'Inserted!'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'Not Inserted!'});
       }
     });
 });

 app.post('/walkinanalysisyear',  urlencodedParser,function (req, res){
   var qur = "SELECT count(*) as totalenq, enquiry_source FROM `student_enquiry_details` WHERE created_on like'"+req.query.current_year+"' and school_id = '"+req.query.schol+"' GROUP BY enquiry_source";

   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

/*this function is used to get the data count of the enquiry came up by that specific academic year*/
 app.post('/getcountyearwise',  urlencodedParser,function (req, res){
   connection.query("SELECT class as classes, COUNT( * ) AS total FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND academic_year='"+req.query.academicyr+"' GROUP BY class ORDER BY (`class`)",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

 app.post('/walkinanalysismonth',  urlencodedParser,function (req, res){
   var qur = "SELECT count(*) as totalenq, enquiry_source FROM `student_enquiry_details` WHERE created_on like'"+req.query.current_year+"' and school_id = '"+req.query.schol+"' GROUP BY enquiry_source";
    //console.log(qur);
    connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

/*this function is used to get the data count of the enquiry came up by that current month*/
 app.post('/getcurrmonthcount',  urlencodedParser,function (req, res){
  var querryyy="SELECT STR_TO_DATE(created_on,'%m/%d/%Y') as date, class as classes, COUNT( * ) AS total FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND created_on like '"+req.query.currmonth+"' GROUP BY class ORDER BY (`class`)";
  //console.log(querryyy);
   connection.query(querryyy,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

 /*this function is used to get the data count of the enquiry came up by that current day*/
 app.post('/getcurrdaycount',  urlencodedParser,function (req, res){
  var querryyy="SELECT class as classes, COUNT( * ) AS total FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND created_on='"+req.query.todate+"' GROUP BY class ORDER BY (`class`)";
  //console.log(querryyy);
   connection.query(querryyy,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });


/*this function is used to fetch the data from the table that has the master details about the followup schedules*/
app.post('/masterfollowupinfo',  urlencodedParser,function (req, res){

    //console.log('qur');
    var id={"school_id":req.query.schol};
    connection.query("SELECT * from md_followup where ?",[id],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 0});
    }
  }
  else{
     console.log(err);
  }
});
});

 app.post('/walkinanalysisday',  urlencodedParser,function (req, res){
   var qur = "SELECT count(*) as totalenq, enquiry_source FROM `student_enquiry_details` WHERE created_on = CURDATE() and school_id = '"+req.query.schol+"' GROUP BY enquiry_source";
   console.log(qur);
   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
            //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });


 app.post('/getacademicyearreport',  urlencodedParser,function (req, res){
   var qur = "SELECT count(*) as totalenq, enquiry_source FROM `student_enquiry_details` WHERE academic_year = '"+req.query.academic_year+"' and school_id = '"+req.query.schol+"' GROUP BY enquiry_source";
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }else{
         console.log(err);
       }
     });
 });

/*this below function fetch the test subject detail of student those who enrolled for the enquiry*/
 app.post('/subjectdetail', urlencodedParser,function (req, res){

var qur="SELECT * from admission_test_details where school_id = '"+req.query.schol+"' and enquiry_id= '"+req.query.id+"' and updated_on='"+req.query.enqdate+"'";

  // console.log(qur);
   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval': 0});
         }
       }
       else{
         console.log(err);
       }
     });
 });

/*this function takes the followup list details for students who all are enquired for admission and not yet been admitted */
app.post('/getlistdetails',  urlencodedParser,function (req, res){
    var school={"school_id":req.query.schol};
    var flwpid={"schedule_id":req.query.fid};
    var scheduleno={"schedule":req.query.flag};
    var qur="SELECT * FROM followupdetail WHERE school_id='"+req.query.schol+"' and schedule_id='"+req.query.fid+"' and schedule='"+req.query.flag+"' and followup_status!='Cancelled' ORDER BY(str_to_date(schedule_date,'%Y-%m-%d'))";
  //  console.log('qur');

    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
     // console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
  }
  else{
     console.log(err);
  }
});
  });

 app.post('/getbetweendatereport',  urlencodedParser,function (req, res){
   var qur = "SELECT STR_TO_DATE(created_on,'%m/%d/%Y') as date, enquiry_source, count(*) as totalenq FROM student_enquiry_details where created_on BETWEEN '"+req.query.from_date+"' and '"+req.query.to_date+"' and school_id = '"+req.query.schol+"' GROUP BY enquiry_source";

   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }else{
         console.log(err);
       }
     });
 });
 app.post('/getadmissionprospectus',  urlencodedParser,function (req, res){
   var querryyy="SELECT class as classes, COUNT( prospectus_no ) AS prospectus FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND academic_year like'"+req.query.academicyr+"' GROUP BY class ORDER BY (`class`)";
  // console.log(querryyy);
   connection.query(querryyy,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

 app.post('/gettotaladmissioncount',  urlencodedParser,function (req, res){
   connection.query("SELECT class as classes, COUNT( status ) AS status FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND academic_year='"+req.query.academicyr+"' AND status='Admitted' GROUP BY class ORDER BY (`class`)",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

 app.post('/gettotalprovisionaladmissioncount',  urlencodedParser,function (req, res){
   connection.query("SELECT class as classes, COUNT( status ) AS provision FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND academic_year='"+req.query.academicyr+"' AND status='Provision' GROUP BY class ORDER BY (`class`)",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

 app.post('/getwithdrawn',  urlencodedParser,function (req, res){
   connection.query("SELECT class as classes, COUNT( status ) AS withdrawncount FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND academic_year='"+req.query.academicyr+"' AND status='Withdrawn' GROUP BY class ORDER BY (`class`)",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });
/*this function is used to update the followup details of the current followup*/
 app.post('/updatefollowupdetails',  urlencodedParser,function (req, res)
{
  var school={"school_id":req.query.schol};
  var scheduledon={"schedule_date":req.query.scheduledate};
  var followupid={"schedule_id":req.query.fid};
  var no={"followup_no":req.query.followupno};
  var collection={"actual_date":req.query.currentdate,"next_followup_date":req.query.nextdate,"followup_comments":req.query.comments,"followup_status":req.query.callstatus,"confidence_level":req.query.confidencelvl};
       connection.query('update followupdetail set ? where ? and ? and ?',[collection,school,followupid,no],
        function(err, rows)
        {
    if(!err)
    {
      console.log('updated');
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });


 /*this function is used to update the followup of the current followup*/
 app.post('/updatefollowupconfidencelvl',  urlencodedParser,function (req, res)
{

  var school={"school_id":req.query.schol};
  var followupid={"id":req.query.fid};
  var confidence={"current_confidence_level":req.query.confidencelvl,"schedule_status":req.query.fnstatus,"schedule_flag":req.query.fnfollowupno,"upcoming_date":req.query.fnupcoming};
  
       connection.query('update followup set ? where ? and ?',[confidence,school,followupid],
        function(err, rows)
        {
    if(!err)
    {
      console.log('updated1');
          res.status(200).json({'returnval': 'success'});


    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });

app.post('/fetchfeecollectionreport-service',  urlencodedParser,function (req, res){
   if(req.query.grade=="All Grades")
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared')";
   else
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared')";
   
 console.log('-----------------------collection report--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });


app.post('/daycollection-service',  urlencodedParser,function (req, res){
  if(req.query.type!="All"){
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"') and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"' ";          
   }
   else
   {
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"'";
   var qur1 = "";
   }
  }
  else{
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') ) or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') ) and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') ";          
   }
   else
   {
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe')  and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque')  and grade='"+req.query.grade+"') and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') ";
   var qur1 = "";
   }
  }
 console.log('-----------------------collection report--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });

app.post('/detaildaycollection-service',  urlencodedParser,function (req, res){
  if(req.query.type!="All"){
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"') and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"' ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"'";
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
  }
  else{
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') ) or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') ) and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe')  and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque')  and grade='"+req.query.grade+"') and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') ";
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
  }
 console.log('-----------------------collection report--------------------------');
 console.log(qur1);
 console.log(qur);
 console.log('--------------------------------------------------');
 var feesplitarr=[];
  connection.query(qur1,function(err, rows){
   if(!err){
   feesplitarr=rows;
   connection.query(qur,function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'feesplit':feesplitarr,'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'feesplit':feesplitarr,'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
   }
  });
});

app.post('/dailyincome-service',  urlencodedParser,function (req, res){
  if(req.query.type!="All"){
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"') and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"' ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"'";
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
  }
  else{
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') ) or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') ) and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe')  and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y'))) and mode_of_payment in('cheque')  and grade='"+req.query.grade+"') and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') ";
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
  }
 console.log('-----------------------collection report--------------------------');
 console.log(qur1);
 console.log(qur);
 console.log('--------------------------------------------------');
 var feesplitarr=[];
  connection.query(qur1,function(err, rows){
   if(!err){
   feesplitarr=rows;
   connection.query(qur,function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'feesplit':feesplitarr,'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'feesplit':feesplitarr,'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
   }
  });
});

app.post('/duecheques-service',  urlencodedParser,function (req, res){
  if(req.query.type!="All"){
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"') and admission_status='"+req.query.type+"') and school_id='"+req.query.schoolid+"' and paid_status in('inprogress') and admission_status='"+req.query.type+"' ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"') and admission_status='"+req.query.type+"') and school_id='"+req.query.schoolid+"' and paid_status in('inprogress') and grade='"+req.query.grade+"' and admission_status='"+req.query.type+"' ";          
    var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
  }
  else{
   if(req.query.grade=="All Grades"){
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and school_id='"+req.query.schoolid+"' and paid_status in('inprogress') ";          
    var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and school_id='"+req.query.schoolid+"' and paid_status in('inprogress') and grade='"+req.query.grade+"'";
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
  }
 console.log('-----------------------collection report--------------------------');
 console.log(qur1);
 console.log(qur);
 console.log('--------------------------------------------------');
 var feesplitarr=[];
  connection.query(qur1,function(err, rows){
   if(!err){
   feesplitarr=rows;
   connection.query(qur,function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'feesplit':feesplitarr,'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'feesplit':feesplitarr,'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
   }
  });
});

app.post('/tpcollection-service',  urlencodedParser,function (req, res){
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM tp_realization_details where (STR_TO_DATE(installment_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(installment_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and school_id='"+req.query.schoolid+"'";          
   }
   else
   {
   var qur = "SELECT * FROM tp_realization_details where (STR_TO_DATE(installment_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(installment_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' ";
   }
 console.log('-----------------------tpcollection report--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });

app.post('/rtecollection-service',  urlencodedParser,function (req, res){
   
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and paymenttype_flag='2') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') and paymenttype_flag='2') and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and paymenttype_flag='2'";          
   }
   else
   {
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe')  and grade='"+req.query.grade+"' and paymenttype_flag='2') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque')  and grade='"+req.query.grade+"' and paymenttype_flag='2') and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and paymenttype_flag='2'";
   var qur1 = "";
   }
  
 console.log('-----------------------rtecollection report--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });


app.post('/fetchfilterreport-service',  urlencodedParser,function (req, res){
  if(req.query.grade=="All Grades"){
  if(req.query.filtertype=="General")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by paid_date";
  else if(req.query.filtertype=="Cheque Collection")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') "+
             " and mode_of_payment='Cheque' order by paid_date";
  else if(req.query.filtertype=="Cash Collection")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') "+
             " and mode_of_payment='Cash' order by paid_date";
  else if(req.query.filtertype=="FeeTypewise Collection")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by installment_type";
   else if(req.query.filtertype=="Overall Collection")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by installment_type";
  }
  else{
  if(req.query.filtertype=="General")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by paid_date";
  else if(req.query.filtertype=="Cheque Collection")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') "+
             " and mode_of_payment='Cheque' order by paid_date";
  else if(req.query.filtertype=="Cash Collection")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') "+
             " and mode_of_payment='Cash' order by paid_date";
  else if(req.query.filtertype=="FeeTypewise Collection")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by installment_type";
   else if(req.query.filtertype=="Overall Collection")
    var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by installment_type";

  }
  console.log('-----------------------Filter report--------------------------');
  console.log(qur);
  console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });


app.post('/fetchoverallcollectionreport-service',  urlencodedParser,function (req, res){
   var qur = "SELECT installment,sum(installment_amount) FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' group by installment,mode_of_payment";
   //console.log('-----------------------collection consolidation report--------------------------');
  // console.log(qur);
  // console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });

/*this below function is used to update the current schdule status of of the followup in followup table*/
app.post('/updateschedulestatus',  urlencodedParser,function (req, res)
{
  var school={"school_id":req.query.schol};
  var followupid={"id":req.query.fid};
  var collection={"reschedule_by":req.query.user,"rescheduled_on":req.query.today,"schedule_status":"Exhausted"};
 // console.log(collection+'  '+followupid);
       connection.query('update followup set ? where ? and ?',[collection,school,followupid],
        function(err, rows)
        {
    if(!err)
    {
      console.log('updated1');
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });

/*this fucntion fetches the all corresponding detail of the current followup*/
app.post('/fetchfollowupmaster',  urlencodedParser,function (req, res){
   var qur = "SELECT * FROM mlzscrm.followup where school_id='"+req.query.schol+"' and id='"+req.query.fid+"'";
 //  console.log(qur);
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }else{
        console.log(err);
       }
     });
 });


 app.post('/getcapacity',  urlencodedParser,function (req, res){
   connection.query("SELECT * FROM `tr_current_capacity` WHERE `school_id` =  '"+req.query.schoolid+"' AND academic_year='"+req.query.academicyr+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

app.post('/fetchprocessingcheque-service',  urlencodedParser,function (req, res){

   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where installment_date>='"+req.query.fromdate+"' "+
             "and installment_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and mode_of_payment='Cheque' and paid_status='inprogress' and cheque_status not in('bounced','cancelled') order by installment_date";
   console.log('-----------------------fetching cheques--------------------------');
   console.log(qur);
   console.log('-------------------------------------------------');

   // var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             // "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and mode_of_payment='Cheque' and paid_status='inprogress' order by paid_date";
  // console.log('-----------------------fetching cheques--------------------------');
 //  console.log(qur);
 //  console.log('-------------------------------------------------');

   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });

app.post('/searchwithdrawcheques-service',  urlencodedParser,function (req, res){
   var qur = "SELECT * FROM md_student_paidfee where school_id='"+req.query.schoolid+"' and (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') and paid_status in ('inprogress','paid') order by paid_date";
  console.log('-----------------------fetching cheques--------------------------');
  console.log(qur);
  console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });


app.post('/insertreturninfo-service',  urlencodedParser,function (req, res){
   var qur = "INSERT INTO md_withdrawal SET ?";

   var response={
    school_id:req.query.schoolid,
    academic_year:req.query.academicyear,
    admission_no:req.query.admissionno,
    student_name:req.query.studentname,
    grade:req.query.grade,
    payable_amount:req.query.payableamount,
    paid_amount:req.query.paidamount,
    returned_amount:req.query.returnamount,
    returned_date:req.query.returndate,
    paytype:req.query.paytype,
    cheque_no:req.query.chequeno,
    bank_name:req.query.bankname,
    created_by:req.query.createdby,
    ack_no:""
   }
   var admninfo=[];
   connection.query("SELECT * FROM receipt_sequence",function(err, rows){
    response.ack_no="ACK-"+response.academic_year+"-"+rows[0].withdraw_seq;
    var new_ack_no=parseInt(rows[0].withdraw_seq)+1;
    // console.log(new_ack_no);
   connection.query(qur,[response],
     function(err, result){
       if(!err){
         if(result.affectedRows>0){
           
           connection.query("UPDATE receipt_sequence SET withdraw_seq='"+new_ack_no+"'",function(err, result){
            if(result.affectedRows>0){
            console.log(result.affectedRows+new_ack_no);
            
            connection.query("SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"'",function(err, rows){
              admninfo=rows;
              connection.query("UPDATE md_admission SET active_status='Withdrawn' WHERE school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"'",function(err, rows){
             if(!err){
              connection.query("UPDATE student_enquiry_details SET status='Withdrawn' WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+admninfo[0].enquiry_no+"'",function(err, result){
            res.status(200).json({'returnval': 'Done!','info':response,'receiptno':response.ack_no,'admninfo':admninfo});
            });
            }
            });
            });
            }
            else
            res.status(200).json({'returnval': 'Seq not updated!'});
            });
         
           // res.status(200).json({'returnval': 'inserted'});
         }else{
           console.log(err);
           res.status(200).json({'returnval': 'not inserted'});
         }
       }
       else{
         console.log(err);
       }
     });

 });
 });


app.post('/updatewithdrawstatus-service',  urlencodedParser,function (req, res){
  
   connection.query("UPDATE md_student_paidfee SET paid_status='Withdrawn',cheque_status='Withdrawn' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') and school_id='"+req.query.schoolid+"'",function(err, rows){
       if(!err)  {  
        connection.query("UPDATE tr_cheque_details SET paid_status='Withdrawn',cheque_status='Withdrawn' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"')  and school_id='"+req.query.schoolid+"'",function(err, rows){    
          if(!err)  {  
            connection.query("UPDATE tr_student_fees SET paid_status='Withdrawn',cheque_status='Withdrawn' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"')  and school_id='"+req.query.schoolid+"'",function(err, rows){    
              if(!err)  { 
              connection.query("UPDATE tr_transfer_details SET paid_status='Withdrawn',cheque_status='Withdrawn' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') and school_id='"+req.query.schoolid+"'",function(err, rows){      
                if(!err){
                  connection.query("UPDATE md_admission SET active_status='Withdrawn' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') and school_id='"+req.query.schoolid+"'",function(err, rows){      
                  if(!err){
                  connection.query("UPDATE student_enquiry_details SET status='Withdrawn' WHERE enquiry_no='"+req.query.enquiryno+"' and school_id='"+req.query.schoolid+"'",function(err, rows){      
                  if(!err)
                  res.status(200).json({'returnval': 'updated'});
                  });
                }
                else
                  console.log(err);
                });
                }
                });
           }
         });
         }
        });
       }
       else
         console.log(err);
       
     });
 });


app.post('/updatechequestatus-service',  urlencodedParser,function (req, res){
  
  var masterupdate="UPDATE md_student_paidfee SET paid_status='inprogress' , cheque_status='"+req.query.chequestatus+"' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
  " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
  " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' and paid_status='"+req.query.paidstatus+"'";

  var chequeupdate="UPDATE tr_cheque_details SET paid_status='inprogress',cheque_status='"+req.query.chequestatus+"' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
  " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
  " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' and cheque_status='"+req.query.paidstatus+"'";


  console.log('----------------------------------------------');
  console.log(masterupdate);
  console.log('----------------------------------------------');
  console.log(chequeupdate);
  var response={};
   if(req.query.chequestatus=="cleared"){
    connection.query("SELECT * FROM receipt_sequence",function(err, rows){
    response.receipt_no="REC-"+req.query.academicyear+"-"+rows[0].receipt_seq;    
    var new_receipt_no=parseInt(rows[0].receipt_seq)+1;
    var masterupdate="UPDATE md_student_paidfee SET realised_date='"+req.query.realiseddate+"',paid_status='"+req.query.chequestatus+"',cheque_status='"+req.query.chequestatus+"',receipt_no='"+response.receipt_no+"' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
    " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
    " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' and paid_status='"+req.query.paidstatus+"'";

    var chequeupdate="UPDATE tr_cheque_details SET realised_date='"+req.query.realiseddate+"',paid_status='"+req.query.chequestatus+"',cheque_status='"+req.query.chequestatus+"',receipt_no='"+response.receipt_no+"' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
    " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
    " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' and cheque_status='"+req.query.paidstatus+"'";

     connection.query(masterupdate,function(err, rows){
       if(!err)  {  
        connection.query(chequeupdate,function(err, rows){    
          if(!err)  { 
            connection.query("UPDATE receipt_sequence SET receipt_seq='"+new_receipt_no+"'",function(err, result){
            if(result.affectedRows>0)
            res.status(200).json({'returnval': 'Updated!'});
            });
            }
          else
            res.status(200).json({'returnval': 'Not Updated!'});
          });
      }
    });
    });
   }
   else if(req.query.chequestatus=="bounced"){
   connection.query("SELECT * FROM discount_percentage WHERE school_id='"+req.query.schoolid+"'",function(err, rows){
    var fine=rows[0].fine_amount;
    var masterupdate="UPDATE md_student_paidfee SET fine_amount='"+rows[0].fine_amount+"',bounce_date='"+req.query.realiseddate+"',realised_date='"+req.query.realiseddate+"',paid_status='inprogress',cheque_status='"+req.query.chequestatus+"' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
    " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
    " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' and paid_status='"+req.query.paidstatus+"'";

   var chequeupdate="UPDATE tr_cheque_details SET realised_date='"+req.query.realiseddate+"',paid_status='inprogress',cheque_status='"+req.query.chequestatus+"' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
    " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
    " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' and cheque_status='"+req.query.paidstatus+"'";
    
    connection.query(masterupdate,function(err, rows){
       if(!err){  
        connection.query(chequeupdate,function(err, rows){    
          if(!err){ 
            res.status(200).json({'returnval': 'Updated!'});
            }
          else
            res.status(200).json({'returnval': 'Not Updated!'});
          });
       }
    });
    });
   }
   else{
    connection.query(masterupdate,function(err, rows){
       if(!err)  {  
        connection.query(chequeupdate,function(err, rows){    
          if(!err)  { 
            res.status(200).json({'returnval': 'Updated!'});
            }
          else
            res.status(200).json({'returnval': 'Not Updated!'});
          });
      }
    });
   }
   
});


app.post('/getrmnamelist',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    connection.query('SELECT employee_name FROM md_employee WHERE (role_id="ROLE101" OR role_id="ROLE102") and ?',[qur],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
    }
    
    else{
     console.log(err);
    }
    });
});



/*this function gets the count of student enquired for the current academic year follwed by respective RM officer*/
app.post('/getrmenquirydetails',  urlencodedParser,function (req, res){
  var qurh="SELECT COUNT( * ) AS total, enquiry_source FROM  `student_enquiry_details` WHERE school_id='"+req.query.schol+"' AND followed_by='"+req.query.followed_by+"' AND academic_year='"+req.query.academicsyr+"' GROUP BY (enquiry_source)";
  //console.log(qurh);
    connection.query(qurh,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
    }
    else{
     console.log(err);
    }
    });
});


/*this function gets the count of student enquired for the current month follwed by respective RM officer*/
app.post('/getcurrentmnthdetails',  urlencodedParser,function (req, res){
  var  qurr="SELECT COUNT( * ) AS total, enquiry_source FROM  `student_enquiry_details` WHERE school_id='"+req.query.schol+"' AND followed_by='"+req.query.followed_by+"' AND created_on like '"+req.query.currmonth+"' GROUP BY (enquiry_source)";
  //console.log(qurr);
    connection.query(qurr,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
    }
    else{
     console.log(err);
    }
    });
});

/*this function gets the count of student enquired for the current date follwed by respective RM officer*/
app.post('/getcurrentdaydetails',  urlencodedParser,function (req, res){
  var qurz="SELECT COUNT( * ) AS total, enquiry_source FROM  `student_enquiry_details` WHERE school_id='"+req.query.schol+"' AND followed_by='"+req.query.followed_by+"' AND created_on='"+req.query.today+"' GROUP BY (enquiry_source)";
  //console.log(qurz);
    connection.query(qurz,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': ''});
    }
    }
    else{
     console.log(err);
    }
    });
});



app.post('/fetchdiscountpercentageinfo',  urlencodedParser,function (req, res){
  var qurz="SELECT * from discount_percentage where school_id='"+req.query.schoolid+"'";
  //console.log(qurz);
    connection.query(qurz,function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      res.status(200).json({'returnval': '0'});
    }
    }
  });
  });

/*this function is used to get the type of enquiry sources available*/
app.post('/getenquirysource',  urlencodedParser,function (req, res){
  var qur={"school_id":req.query.schol};
    connection.query('select * from md_enquiry_source where ?',[qur],

    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);

      res.status(200).json({'returnval': ''});

    }
    }
    else{
     console.log(err);
    }
    });
});


  app.post('/getcounsellor',  urlencodedParser,function (req, res){
   connection.query("SELECT distinct orginated_by FROM `student_enquiry_details` WHERE `school_id` =  '"+req.query.schoolid+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

  app.post('/getcounsellorattendedby',  urlencodedParser,function (req, res){
   connection.query("SELECT e.employee_id, e.employee_name FROM md_employee as e JOIN md_role as r ON e.role_id = r.role_id WHERE role_name = 'COUNSELLOR' AND e.school_id = '"+req.query.schol+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });
  app.post('/getmothertongue',  urlencodedParser,function (req, res){
   connection.query("SELECT * FROM `md_mother_tongue`",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });
  app.post('/getstudentsforcounselor',  urlencodedParser,function (req, res){
   connection.query("SELECT enquiry_name, enquiry_no,created_on, class FROM `student_enquiry_details` WHERE `school_id` = '"+req.query.schoolid+"' AND `orginated_by` =  '"+req.query.counsellor+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
            //console.log(rows);
            res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });
    app.post('/exchangestudents',  urlencodedParser,function (req, res){
   connection.query("UPDATE `student_enquiry_details` SET `followed_by` = '"+req.query.counsellor+"' WHERE `school_id` = '"+req.query.schoolid+"' AND `enquiry_no` =  '"+req.query.enquiryno+"'",
     function(err, rows)
    {
    if(!err)
    {
      connection.query("UPDATE `followup` SET `followed_by` = '"+req.query.counsellor+"' WHERE `school_id` = '"+req.query.schoolid+"' AND `enquiry_id` =  '"+req.query.enquiryno+"'",function(err, rows){
        if(!err){
          console.log('inserted');
          res.status(200).json({'returnval': 'success'});
        }else{
          console.log(err);
          res.status(200).json({'returnval': 'invalid'});
        }
      });
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });

 app.post('/FnChangestatus',  urlencodedParser,function (req, res)
 {
    var check=req.query.fnstatus;
    var enquiryid=req.query.fnenqid;
   var school={"school_id":req.query.schol};
   var collection={"reschedule_by":req.query.user,"rescheduled_on":req.query.today,"schedule_status":req.query.fnstatus};
   var followupid={"id":req.query.followupid};
   connection.query('update followup set ? where ? and ?',[collection,school,followupid],
     function(err, rows)
     {
       if(!err)
       {
         console.log('inserted');
         res.status(200).json({'returnval': 'success'});
         if(check=='Not Interested'){
            connection.query('update student_enquiry_details set status="Closed" where ? and ?',[school,enquiryid],
             function(err, rows)
             {
               if(!err)
               {
                 console.log('inserted');
               }
               else
               {
                 console.log(err);
               }

             });
         }
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }

     });
 });

app.post('/submitenqdetails',  urlencodedParser,function (req, res){
      if(req.query.discountreferraltype=='1'||req.query.discountreferraltype=='9')
      var refferaltype=''
      else
      var refferaltype=req.query.discountreferraltype
    var response={
      school_id:req.query.schol,
      created_on:req.query.createdon,
      academic_year:req.query.academicyear,
      class:req.query.grade,
      first_name:req.query.firstname,
      middle_name:req.query.middlename,
      last_name:req.query.lastname,
      gender:req.query.gender,
      dob:req.query.dobdate,
      father_mob:req.query.mob,
      mother_mob:req.query.mothermob,
      enquiry_source:req.query.enquiysource,
      locality:req.query.location,
      have_sibling:req.query.havesibling,
      father_name:req.query.fathername,
      mother_name:req.query.mothername,
      father_occupation:req.query.dadoccupationinfo,
      mother_occupation:req.query.motheroccupationinfo,
      father_email:req.query.email,
      mother_email:req.query.motheremail,
      mother_tongue:req.query.mothertonguelanguage,
      enquiry_name:req.query.enquiryname,
      status:req.query.status,
      guardian_mail:req.query.guardianemail,
      guardian_mobile:req.query.guardianmobile,
      guardian_name:req.query.guardianname,
      year_type:req.query.enrolltype,
      enquiry_no:req.query.enquiry_no,
      orginated_by:req.query.attenedcounsellorname,
      followed_by:req.query.attenedcounsellorname,
      guardian_occup:req.query.guardianoccupationinfo,
      parent_or_guardian_work:req.query.parent_or_guardian_work,
      referral:req.query.referralvalue,
      school_name:req.query.school_name,
      school_area:req.query.school_area,
      sibling_remark:req.query.sibling_remark,
      parent_or_guard:req.query.parentorguard,
      refferal_type:refferaltype,
      age:req.query.ageofyr,
      both_working:req.query.bothworking,
      guard_working:req.query.guardworking,
      who_works:req.query.whoworking,
      enquired_date:req.query.enquirydate
    };

    connection.query('INSERT INTO student_enquiry_details SET ?',[response],function(err, rows){
      if(!err){
      if(req.query.discountreferraltype=="1"||req.query.discountreferraltype=="9")
      {
        console.log('---------------------------');
        console.log(req.query.discountreferraltype+" "+req.query.referrerid);
        console.log('---------------------------');
        connection.query("UPDATE md_admission SET referral_type='"+req.query.discountreferraltype+"' WHERE admission_no='"+req.query.referrerid+"'",function(err, rows){
        if(!err)
        res.status(200).json({'returnval': 'inserted'});
        });

      }
      else
        res.status(200).json({'returnval': 'inserted'});
      }
      else{
      console.log(err);
      res.status(200).json({'returnval': 'not inserted'});
    }
    });
});

app.post('/updateenqdetails',  urlencodedParser,function (req, res){
    // if(req.query.discountreferraltype=='1'||req.query.discountreferraltype=='9')
    // var refferaltype=''
    // else
    // var refferaltype=req.query.discountreferraltype
    console.log('have sibling........'+req.query.havesibling+" "+req.query.havesibling.length);
    var response={
      school_id:req.query.schol,
      // created_on:req.query.createdon,
      academic_year:req.query.academicyear,
      class:req.query.grade,
      first_name:req.query.firstname,
      middle_name:req.query.middlename,
      last_name:req.query.lastname,
      gender:req.query.gender,
      dob:req.query.dobdate,
      father_mob:req.query.mob,
      mother_mob:req.query.mothermob,
      enquiry_source:req.query.enquiysource,
      locality:req.query.location,
      have_sibling:req.query.havesibling,
      father_name:req.query.fathername,
      mother_name:req.query.mothername,
      father_occupation:req.query.dadoccupationinfo,
      mother_occupation:req.query.motheroccupationinfo,
      father_email:req.query.email,
      mother_email:req.query.motheremail,
      mother_tongue:req.query.mothertonguelanguage,
      enquiry_name:req.query.enquiryname,
      // status:req.query.status,
      guardian_mail:req.query.guardianemail,
      guardian_mobile:req.query.guardianmobile,
      guardian_name:req.query.guardianname,
      // year_type:req.query.enrolltype,
      // enquiry_no:req.query.enquiry_no,
      // orginated_by:req.query.attenedcounsellorname,
      // followed_by:req.query.attenedcounsellorname,
      guardian_occup:req.query.guardianoccupationinfo,
      parent_or_guardian_work:req.query.parent_or_guardian_work,
      referral:req.query.referralvalue,
      school_name:req.query.school_name,
      school_area:req.query.school_area,
      sibling_remark:req.query.sibling_remark,
      parent_or_guard:req.query.parentorguard,
      // refferal_type:refferaltype,
      age:req.query.ageofyr,
      both_working:req.query.bothworking,
      guard_working:req.query.guardworking,
      who_works:req.query.whoworking
    };
    
    var enquiryno={enquiry_no:req.query.enquiryno};
    var schoolid={school_id:req.query.schol};

    connection.query('UPDATE student_enquiry_details SET ? WHERE ? and ?',[response,enquiryno,schoolid],function(err, rows){
      if(!err){
      res.status(200).json({'returnval': 'Updated!!'});
      // if(req.query.discountreferraltype=="1"||req.query.discountreferraltype=="9")
      // {
      //   console.log('---------------------------');
      //   console.log(req.query.discountreferraltype+" "+req.query.referrerid);
      //   console.log('---------------------------');
      //   connection.query("UPDATE md_admission SET referral_type='"+req.query.discountreferraltype+"' WHERE admission_no='"+req.query.referrerid+"'",function(err, rows){
      //   if(!err)
      //   res.status(200).json({'returnval': 'inserted'});
      //   });

      // }
      // else
      //   res.status(200).json({'returnval': 'inserted'});
      // }
      // else{
      // console.log(err);
      // res.status(200).json({'returnval': 'not inserted'});
      }
      else{
      console.log(err);
      res.status(200).json({'returnval': 'Unable to update!!'});
      }
    });
});

app.post('/getprofession',  urlencodedParser,function (req, res){
  connection.query("SELECT * FROM `md_profession`",
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval':null});
        }
      } else {
        console.log(err);
      }
    });
});
app.post('/getstudentsinlocation',  urlencodedParser,function (req, res){
  var qur = "SELECT COUNT(*) as total_enquired_students FROM `student_enquiry_details` WHERE `locality` = '"+req.query.location+"' AND `status` = 'Enquired' AND `school_id` = '"+req.query.schol+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval':null});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/getadmittedstudentsinlocation',  urlencodedParser,function (req, res){
  var qur = "SELECT COUNT(*) as total_enquired_students FROM `student_enquiry_details` WHERE `locality` = '"+req.query.location+"' AND `status` = 'Admitted' AND `school_id` = '"+req.query.schol+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval':null});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/getprovisionallyadmittedstudentsinlocation',  urlencodedParser,function (req, res){
  var qur = "SELECT COUNT(*) as total_enquired_students FROM `student_enquiry_details` WHERE `locality` = '"+req.query.location+"' AND `status` = 'Provision' AND `school_id` = '"+req.query.schol+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval':null});
        }
      } else {
        console.log(err);
      }
    });
});

 app.post('/scheduledates',  urlencodedParser,function (req, res){
   connection.query("SELECT schedule_date FROM followupdetail WHERE `school_id` =  '"+req.query.schol+"' and schedule_id='"+req.query.folowid+"' and followup_status!='Cancelled' order by(str_to_date(schedule_date,'%Y-%m-%d'))",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
          //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

app.post('/siblingdetails',  urlencodedParser,function (req, res){
  var qur = "SELECT p.parent_name, (SELECT class FROM class_details WHERE id = s.class_id AND school_id = '"+req.query.schol+"') as class, (SELECT section FROM class_details WHERE id = s.class_id AND school_id = '"+req.query.schol+"') as section FROM student_details s JOIN parent p ON s.id = p.student_id WHERE s.school_id = '"+req.query.schol+"' AND s.id = '"+req.query.student_id+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval':null});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/referraldetails',  urlencodedParser,function (req, res){
  var qur = "SELECT student_name, (SELECT class FROM class_details WHERE id = class_id AND school_id = '"+req.query.schol+"') as class, (SELECT section FROM class_details WHERE id = class_id AND school_id = '"+req.query.schol+"') as section FROM student_details WHERE school_id = '"+req.query.schol+"' AND id = '"+req.query.student_id+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval':null});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/savereferraldata',  urlencodedParser,function (req, res){
    var response={
      school_id:req.query.schol,
      enquiry_no:req.query.enquiry_no,
      referred_student_name:req.query.studentname,
      referred_parent_name:req.query.parentname,
      referred_student_grade:req.query.grade,
      school_id:req.query.section,
      referral_type:req.query.referral_type
    };
    connection.query('INSERT INTO tr_referrals SET ?',[response],function(err, rows){
      if(!err)
      res.status(200).json({'returnval': 'Inserted'});
      else{
      console.log(err);
      res.status(200).json({'returnval': 'not inserted'});
    }
    });

});



app.post('/deleterowfollowup',  urlencodedParser,function (req, res)
{
   var collection={"followup_status":req.query.status,"created_on":req.query.today,"created_by":req.query.user};

    var school={"school_id":req.query.schol};
    var enquiry={"schedule_id":req.query.followupid};
    var enquiry1={"schedule":req.query.scheduleid};
    var enquiry2={"followup_no":req.query.followupnoz};

       connection.query("update followupdetail set ? where ? and ? and ? and ? and followup_status!='Cancelled'",[collection,enquiry,school,enquiry2,enquiry1],
    function(err, rows)
    {
    if(!err)
    {
        console.log('deleted');
          res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
  });


app.post('/insertfollowuprow',  urlencodedParser,function (req, res){
     connection.query("SELECT count(*) as total FROM followupdetail WHERE `school_id` =  '"+req.query.schoolid+"' and schedule_id='"+req.query.scheduleid+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
          var l=rows.length;
          var followupnoqwe=parseInt(rows[0].total)+1;
          console.log((rows[0].total)+'   '+followupnoqwe);
            var response={
            school_id:req.query.schoolid,
            schedule_id:req.query.scheduleid,
            followup_no:followupnoqwe,
            schedule_date:req.query.scheduledate,
            confidence_level:req.query.confidencelevel,
            created_by:req.query.createdby,
            created_on:req.query.createdon,
            next_followup_date:req.query.nextfollowupdate,
            schedule:req.query.schedule,
            followup_status:req.query.followupstatus,
            enquiry_id:req.query.enquiryidb
          };
                  connection.query('INSERT INTO followupdetail SET ?',[response],function(err, rows){
                    if(!err)
                      console.log('inserted');
                    else{
                    console.log(err);
                  }
                  });
           res.status(200).json({'returnval': 'Inserted'});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':'cancelled'});
         }
       }
       else{
         console.log(err);
       }
     });

});




app.post('/fetchschooltype-service',  urlencodedParser,function (req, res){
   connection.query("SELECT * FROM md_schooltype",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
            //console.log(rows);
            res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval': 'no rows'});
         }
       }
       else{
         console.log(err);
       }
     });
 });


app.post('/fetchschooltypegrade-service',  urlencodedParser,function (req, res){
   connection.query("SELECT * FROM grade_master",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
            //console.log(rows);
            res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval': 'no rows'});
         }
       }
       else{
         console.log(err);
       }
     });
 });


app.post('/fetchfeecodeforsplitup-service',  urlencodedParser,function (req, res){
   connection.query("SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and grade_id='"+req.query.grade+"' ",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
            //console.log(rows);
            res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval': 'no rows'});
         }
       }
       else{
         console.log(err);
       }
     });
 });

app.post('/fetchinstallmentsplit-service',  urlencodedParser,function (req, res){
   connection.query("SELECT * FROM md_fee_splitup_master WHERE school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
            //console.log(rows);
            res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval': 'no rows'});
         }
       }
       else{
         console.log(err);
       }
     });
 });


app.post('/fetchfeesplitup-service',  urlencodedParser,function (req, res){
   connection.query("SELECT * FROM fee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type not in('Registration fee')",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
            //console.log(rows);
            res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval': 'no rows'});
         }
       }
       else{
         console.log(err);
       }
     });
 });

app.post('/generatemasterfeesplitupcode-service',  urlencodedParser,function (req, res){
var check="SELECT * FROM md_fee_splitup_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"'";
connection.query(check,function(err, rows){
   if(rows.length==0){
    connection.query("SELECT * FROM fee_code_sequence WHERE school_id='"+req.query.schoolid+"'",function(err, rows){
      if(rows.length>0){
        var feecode="Splitfee"+rows[0].feesplitseq_code;
        var new_seq=parseInt(rows[0].feesplitseq_code)+1;
        connection.query("UPDATE  fee_code_sequence SET feesplitseq_code='"+new_seq+"' and school_id='"+req.query.schoolid+"'",function(err, result){
         if(result.affectedRows>0)
         {            
            res.status(200).json({'returnval': feecode});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval': 'no'});
         }
       });
      }
      });
  }
  else{
    res.status(200).json({'returnval':'exist'});
  }
});
});

app.post('/insertmasterfeesplitup-service',  urlencodedParser,function (req, res){

   var response={
    school_id:req.query.schoolid,
    academic_year:req.query.academicyear,
    admission_year:req.query.admissionyear,
    grade:req.query.grade,
    fee_code:req.query.feecode,
    base_fee_type:req.query.basefeetype,
    fee_type:req.query.feetype,
    amount:req.query.amount,
    created_by:req.query.createdby,
    split_schedule_code:req.query.splitupcode,
    no_of_installment:req.query.noofinstallment,
    installment_pattern:req.query.installmentpattern,
    installment_no:req.query.insno
   } 
   
    connection.query("INSERT INTO md_fee_splitup_master SET ?",[response],function(err, rows)
     {
       if(!err)
       {        
        res.status(200).json({'returnval': 'Inserted!'});
       }
       else
        console.log(err);
     });
 
 });


app.post('/fetchtotalsplitupamount-service',  urlencodedParser,function (req, res){

  var qur="SELECT * FROM md_fee_splitup_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
  " and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"'";
  console.log('-----------------------------------------------');
  console.log(qur);
  console.log('-----------------------------------------------');
    connection.query(qur,function(err, rows)
     {
       if(!err)
       {        
        res.status(200).json({'returnval': rows});
       }
       else
        res.status(200).json({'returnval': 'no rows'});
     });

});


app.post('/fetchinstallmentdate-service',  urlencodedParser,function (req, res){
console.log(req.query.schoolid);
  var qur="SELECT * FROM md_installment_date WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment_pattern='"+req.query.installmentpattern+"' ";
  console.log('-----------------------------------------------');
  console.log(qur);
  console.log('-----------------------------------------------');
    connection.query(qur,function(err, rows)
     {
       if(!err)
       {        
        res.status(200).json({'returnval': rows});
       }
       else
        res.status(200).json({'returnval': 'no rows'});
     });
});


app.post('/fetchmasterpaidfee-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and (admission_no='"+req.query.admissionno+"' or enquiry_no like '"+req.query.admissionno+"') and cheque_status not in ('bounced','cancelled')";
  console.log('-----------------------------------------------');
  console.log(qur);
  console.log('-----------------------------------------------');
    connection.query(qur,function(err, rows)
     {
       if(!err)
       {        
        res.status(200).json({'returnval': rows});
       }
       else
        res.status(200).json({'returnval': 'no rows'});
     });
});


app.post('/fetchreceipt-service',  urlencodedParser,function (req, res){
console.log(req.query.schoolid);
  var qur="SELECT *,(select father_name from md_admission where school_id='"+req.query.schoolid+"' "+
  "and academic_year='"+req.query.academicyear+"' and (admission_no='"+req.query.admissionno+"' "+ 
  "or enquiry_no like '"+req.query.admissionno+"')) as fathername,(select mother_name from md_admission where school_id='"+req.query.schoolid+"' "+
  "and academic_year='"+req.query.academicyear+"' and (admission_no='"+req.query.admissionno+"' "+
  "or enquiry_no like '"+req.query.admissionno+"')) as mothername FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and (admission_no='"+req.query.admissionno+"' or student_name='"+req.query.name+"' or enquiry_no like '"+req.query.admissionno+"') and cheque_status not in('bounced','cancelled')";
  console.log('-----------------------------------------------');
  console.log(qur);
  console.log('-----------------------------------------------');
    connection.query(qur,function(err, rows)
     {
       if(!err)
       {        
        res.status(200).json({'returnval': rows});
       }
       else
        res.status(200).json({'returnval': 'no rows'});
     });
});


app.post('/fetchsplitup-service',  urlencodedParser,function (req, res){
console.log(req.query.schoolid);
  var qur="SELECT * FROM md_fee_splitup_master WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"'";
  console.log('-----------------------------------------------');
  console.log(qur);
  console.log('-----------------------------------------------');
    connection.query(qur,function(err, rows)
     {
       if(!err)
       {        
        res.status(200).json({'returnval': rows});
       }
       else
        res.status(200).json({'returnval': 'no rows'});
     });
});

app.post('/gettodayfollowupdetails',  urlencodedParser,function (req, res){
  var qur="SELECT s.enquiry_no, s.first_name, s.last_name, s.class, s.father_mob, s.mother_mob FROM student_enquiry_details as s join followup as f ON f.enquiry_id = s.enquiry_no WHERE s.school_id = '"+req.query.schol+"' and f.followed_by = '"+req.query.counsellor+"' AND f.upcoming_date = CURDATE() AND f.schedule_status = '"+req.query.status+"'";
    connection.query(qur,function(err, rows)
     {
       if(!err)
       {        
        res.status(200).json({'returnval': rows});
       }
       else
        res.status(200).json({'returnval': 'no rows'});
     });
});

app.post('/gettotalfollowuptoday',  urlencodedParser,function (req, res){
  var qur="SELECT COUNT(*) as total FROM student_enquiry_details as s join followup as f ON f.enquiry_id = s.enquiry_no WHERE s.school_id = '"+req.query.schol+"' and f.followed_by = '"+req.query.counsellor+"' AND f.upcoming_date = CURDATE() AND f.schedule_status = '"+req.query.status+"'";
    connection.query(qur,function(err, rows)
     {
       if(!err)
       {        
        res.status(200).json({'returnval': rows});
       }
       else
        res.status(200).json({'returnval': 'no rows'});
     });
});

app.post('/pendingfeereport-service',  urlencodedParser,function (req, res){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where installment_date>='"+req.query.fromdate+"' "+
             "and installment_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('inprogress')";
 console.log('-----------------------pending fee report--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });


app.post('/fetchnotpaidreport-service',  urlencodedParser,function (req, res){
 var qur1 = "select * from md_student where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";

 if(req.query.grade=="All Grades")
var qur2 = "SELECT admission_no FROM md_admission WHERE admission_no NOT IN "+
" (SELECT s.admission_no FROM  md_student_paidfee f JOIN md_admission s "+
" ON ( f.admission_no = s.admission_no ) where  f.admission_status='Promoted' "+ 
" and s.admission_status='Promoted' and f.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and cheque_status!='cancelled') "+
" and admission_status='Promoted' and active_status not in ('Cancelled','Withdrawn') and discount_type not in ('3') and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
 else
var qur2 = "SELECT admission_no FROM md_admission WHERE admission_no NOT IN "+
" (SELECT s.admission_no FROM  md_student_paidfee f JOIN md_admission s "+
" ON ( f.admission_no = s.admission_no ) where  f.admission_status='Promoted' "+ 
" and s.admission_status='Promoted' and f.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and cheque_status!='cancelled' ) "+
" and admission_status='Promoted' and active_status not in ('Cancelled','Withdrawn') and discount_type not in ('3') and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and class_for_admission='"+req.query.grade+"'";

 console.log('----------------------- fee not paid report --------------------------');
 console.log(qur1);
 console.log('-------------------------------------------------');
 console.log(qur2);
 var qur3="select * from grade_master";
 var studarr=[];
 var admnarr=[];
   connection.query(qur1,function(err, rows){
       if(!err){
         if(rows.length>0){
           studarr=rows;
          connection.query(qur2,function(err, rows){
          if(!err){
          if(rows.length>0){
           admnarr=rows;
           connection.query(qur3,function(err, rows){
           res.status(200).json({'studarr': studarr,'admnarr': admnarr,'gradearr': rows});
           });
          }
          else
          res.status(200).json({'returnval':'no rows'});
          }
          });
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });


app.post('/pendingfeecollectionreport-service',  urlencodedParser,function (req, res){
   console.log('-------------------');
   console.log(req.query.grade+"   "+req.query.type);
   if(req.query.grade=='All Grades'){
    console.log('all grades...................');
   // var totalqur = "select admission_no,student_name,grade,sum(actual_amount) as actualamount,sum(discount_amount) as discountamount,sum(installment_amount) as payableamount from "+
   // "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and cheque_status not in('bounced') group by school_id,admission_no,student_name,grade";
   
   if(req.query.type=='All'){
   var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='AY-2017-2018' "+
    " and pf.academic_year='AY-2017-2018' and pf.school_id='SCH002' "+
    " and m.school_id='SCH002' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   }
   if(req.query.type=='New'){
    var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount   from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='New' group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='AY-2017-2018' "+
    " and pf.academic_year='AY-2017-2018' and pf.school_id='SCH002' "+
    " and m.school_id='SCH002' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and admission_status='New' and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   }
   if(req.query.type=='Promoted'){
    var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='Promoted' group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='AY-2017-2018' "+
    " and pf.academic_year='AY-2017-2018' and pf.school_id='SCH002' "+
    " and m.school_id='SCH002' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and admission_status='Promoted' and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   }
   var pendingqur = "select admission_no,student_name,grade,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status not in "+
   "('paid','cleared','inprogress') and cheque_status in('bounced','cancelled') group by school_id,admission_no,student_name,grade";
  }
  else{
    console.log('spec grades...................');
   // var totalqur = "select admission_no,student_name,grade,sum(actual_amount) as actualamount,sum(discount_amount) as discountamount,sum(installment_amount) as payableamount from "+
   // "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and cheque_status not in('bounced') group by school_id,admission_no,student_name,grade";
   if(req.query.type=='All'){
   var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount ,sum(difference_amount) as diffamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') group by school_id,admission_no,student_name";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='AY-2017-2018' "+
    " and pf.academic_year='AY-2017-2018' and pf.school_id='SCH002' "+
    " and m.school_id='SCH002' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " and pf.class_for_admission='"+req.query.grade+"' group by pf.admission_no" ;
   }
   if(req.query.type=='New'){
   var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='New' group by school_id,admission_no,student_name";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='AY-2017-2018' "+
    " and pf.academic_year='AY-2017-2018' and pf.school_id='SCH002' "+
    " and m.school_id='SCH002' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " and pf.class_for_admission='"+req.query.grade+"' and admission_status='New' group by pf.admission_no" ;
   }
   if(req.query.type=='Promoted'){
   var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='Promoted' group by school_id,admission_no,student_name";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='AY-2017-2018' "+
    " and pf.academic_year='AY-2017-2018' and pf.school_id='SCH002' "+
    " and m.school_id='SCH002' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " and pf.class_for_admission='"+req.query.grade+"' and admission_status='Promoted' group by pf.admission_no" ;
   }
   var pendingqur = "select admission_no,student_name,grade,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' AND school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and  paid_status not in "+
   "('paid','cleared','inprogress') and cheque_status in('bounced','cancelled') group by school_id,admission_no,student_name,grade";
   }
 console.log('-----------------------pending fee report--------------------------');
 console.log(totalqur);
 console.log('-------------------------------------------------');
  console.log(paidqur);
 console.log('-------------------------------------------------');
  console.log(pendingqur);
 console.log('-------------------------------------------------');
 var totalarr=[];
 var paidarr=[];
 var pendingarr=[];
   connection.query(totalqur,function(err, rows){
       if(!err){         
          totalarr=rows;
          connection.query(paidqur,function(err, rows){
            if(!err){
              paidarr=rows;
              connection.query(pendingqur,function(err, rows){
              if(!err){
              pendingarr=rows;
              res.status(200).json({'totalarr':totalarr,'paidarr':paidarr,'pendingarr':pendingarr});
              }
              });
            }
          });
        }
       else{
         console.log(err);
       }
     });
 });

app.post('/dailycollectionreport-service',  urlencodedParser,function (req, res){
 if(req.query.grade=="All Grades")
 var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','cleared','inprogress')";
 else
 var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','cleared','inprogress')";

 console.log('-----------------------daily fee report--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });


app.post('/fetchbouncecheques-service',  urlencodedParser,function (req, res){
   var qur = "SELECT * FROM mlzscrm.md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('inprogress') and cheque_status in('bounced')";
 console.log('-----------------------fetch bounce cheque--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });

app.post('/fetchpdccheques-service',  urlencodedParser,function (req, res){
 // if(req.query.flag==0)
 // var qur = "SELECT * FROM mlzscrm.md_student_paidfee where STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') "+
 //             "and school_id='"+req.query.schoolid+"' and cheque_status in('inprogress') and cheque_status not in('bounced','cancelled')";
 // else
 // var qur = "SELECT * FROM mlzscrm.md_student_paidfee where STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') "+
 //             "and school_id='"+req.query.schoolid+"' and cheque_status in('inprogress') and cheque_status not in('bounced','cancelled')";

 if(req.query.filterby=="Cheque Date"){
 if(req.query.flag==0)
 var qur = "SELECT * FROM mlzscrm.md_student_paidfee where cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"') and cheque_date='"+req.query.fromdate+"' "+
           "and school_id='"+req.query.schoolid+"' and cheque_status in('inprogress') and cheque_status not in('bounced','cancelled')";
 else
 var qur = "SELECT * FROM mlzscrm.md_student_paidfee where cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"') and "+
           "STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') "+
           "and school_id='"+req.query.schoolid+"' and cheque_status in('inprogress') and cheque_status not in('bounced','cancelled')";
 }
 if(req.query.filterby=="Received Date"){
 if(req.query.flag==0)
 var qur = "SELECT * FROM mlzscrm.md_student_paidfee where cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"') and received_date='"+req.query.fromdate+"' "+
           "and school_id='"+req.query.schoolid+"' and cheque_status in('inprogress') and cheque_status not in('bounced','cancelled')";
 else
 var qur = "SELECT * FROM mlzscrm.md_student_paidfee where cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"') and "+
           "STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') "+
           "and school_id='"+req.query.schoolid+"' and cheque_status in('inprogress') and cheque_status not in('bounced','cancelled')";
 }
 console.log('-----------------------fetch pdc cheque--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });


app.post('/fetchchequecollection-service',  urlencodedParser,function (req, res){
 

 if(req.query.flag==0)
 var qur = "SELECT * FROM mlzscrm.md_student_paidfee where  cheque_date='"+req.query.fromdate+"' "+
           "and school_id='"+req.query.schoolid+"' and cheque_status in('inprogress') and cheque_status not in('bounced','cancelled')";
 else
 var qur = "SELECT * FROM mlzscrm.md_student_paidfee where  "+
           "STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') "+
           "and school_id='"+req.query.schoolid+"' and cheque_status in('inprogress') and cheque_status not in('bounced','cancelled')";
 
 
 console.log('-----------------------fetch cheque--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
 });


app.post('/fetchdiscountstructure-service',  urlencodedParser,function (req, res){
 if(req.query.admissionyear=="All"&&req.query.grade=="all")
 var qur = "SELECT * FROM mlzscrm.md_discount_master where academic_year='"+req.query.academicyear+"'  and (from_date>='"+req.query.fromdate+"' "+
             "or to_date<='"+req.query.todate+"') and school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear=="All"&&req.query.grade!="all")
 var qur = "SELECT * FROM mlzscrm.md_discount_master where academic_year='"+req.query.academicyear+"'  and grade='"+req.query.grade+"' and (from_date>='"+req.query.fromdate+"' "+
             "or to_date<='"+req.query.todate+"') and school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear!="All"&&req.query.grade!="all")
 var qur = "SELECT * FROM mlzscrm.md_discount_master where academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"' and (from_date>='"+req.query.fromdate+"' "+
             "or to_date<='"+req.query.todate+"') and school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear!="All"&&req.query.grade=="all")
 var qur = "SELECT * FROM mlzscrm.md_discount_master where academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and (from_date>='"+req.query.fromdate+"' "+
             "or to_date<='"+req.query.todate+"') and school_id='"+req.query.schoolid+"' ";
 
 console.log('-----------------------fetch discount structure--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
   connection.query(qur,
     function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
     });
});

app.post('/fetchfeestructure-service',  urlencodedParser,function (req, res){

 var titlequr="SELECT distinct(fee_type) FROM fee_splitup where school_id='"+req.query.schoolid+"'"; 
 if(req.query.admissionyear=='All'&&req.query.grade=="all")
 var qur = "SELECT * FROM mlzscrm.fee_master fm join "+
 "fee_splitup fs on (fm.fee_code=fs.fee_code) where fm.academic_year='"+req.query.academicyear+"' "+
 " and fm.school_id='"+req.query.schoolid+"' and fs.school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear=='All'&&req.query.grade!="all")
 var qur = "SELECT * FROM mlzscrm.fee_master fm join "+
 "fee_splitup fs on (fm.fee_code=fs.fee_code) where fm.academic_year='"+req.query.academicyear+"' "+
 " and grade_id='"+req.query.grade+"' and fm.school_id='"+req.query.schoolid+"' and fs.school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear!='All'&&req.query.grade!="all")
 var qur = "SELECT * FROM mlzscrm.fee_master fm join "+
 "fee_splitup fs on (fm.fee_code=fs.fee_code) where fm.academic_year='"+req.query.academicyear+"' and fm.admission_year='"+req.query.admissionyear+"' "+
 " and grade_id='"+req.query.grade+"' and fm.school_id='"+req.query.schoolid+"' and fs.school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear!='All'&&req.query.grade=="all")
 var qur = "SELECT * FROM mlzscrm.fee_master fm join "+
 "fee_splitup fs on (fm.fee_code=fs.fee_code) where fm.academic_year='"+req.query.academicyear+"' and fm.admission_year='"+req.query.admissionyear+"' "+
 " and fm.school_id='"+req.query.schoolid+"' and fs.school_id='"+req.query.schoolid+"' ";

 console.log('-----------------------fetch fee structure structure--------------------------');
 console.log(qur);
 console.log('-------------------------------------------------');
  var title=[];
  connection.query(titlequr,function(err, rows){
   if(rows.length>0){
    title=rows;
   connection.query(qur,function(err, rows){
       if(!err){
         if(rows.length>0){
           res.status(200).json({'returnval': rows,'titlearr':title});
         }else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
       }else{
         console.log(err);
       }
   });
   }
  });
});


/*this function is used to fetch the detail of the follow up detail of the specific followup no and by its id*/
app.post('/detailshow',  urlencodedParser,function (req, res){

var queeyy="SELECT * FROM followupdetail where school_id='"+req.query.schol+"' and schedule_id='"+req.query.fid+"' and followup_no='"+req.query.fno+"' and followup_status='"+req.query.call+"'";
console.log(queeyy);
  connection.query(queeyy,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval':null});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/getenquiryreferrals',  urlencodedParser,function (req, res){
  var queeyy="SELECT * FROM md_referrals where school_id='"+req.query.schol+"'";
  connection.query(queeyy,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval':null});
        }
      } else {
        console.log(err);
      }
    });
});

/*this function is used to create the discount type master*/

app.post('/discountcreation' ,  urlencodedParser,function (req, res)
{  
    var response={"discount_type_name":req.query.discountname,
    "discount_type":req.query.discountid,
    "id":req.query.discountseqid}; 
    
    console.log(response);
    connection.query("SELECT * FROM md_discounts WHERE  discount_type_name='"+req.query.discountname+"' or discount_type='"+req.query.discountid+"' and id='"+req.query.discountseqid+"'",
      function(err, rows)
    {
      console.log(rows);
    if(rows.length==0)
    {
    connection.query("INSERT INTO md_discounts SET ?",[response],
    function(err, rows)
    {
     if(!err)
            {
              var tempseq=parseInt((req.query.discountseqid).substring(0))+1;
                      connection.query("UPDATE sequence SET discount_seq='"+tempseq+"'", function (err,result){
                        if(result.affectedRows>0)
                      res.status(200).json({'returnval': 'Inserted!'});
                    });
            }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'Not Inserted!'});
    }
    });
    }
    else
    {
      res.status(200).json({'returnval': 'failed'});
    }
  });
});


/*this function is used to fetch the discount types*/

app.post('/fetchdiscount',  urlencodedParser,function (req,res)
{  
  var qur="SELECT * FROM md_discounts";
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    { 
      //console.log(JSON.stringify(rows));   
      res.status(200).json({'returnval': rows});
    }
    else
      res.status(200).json({'returnval': ''});
  });
});

/*this function is used to generate discount sequence*/
app.post('/fetchdiscountseq',  urlencodedParser,function (req,res)
{  
  
  var qur="SELECT * FROM sequence";
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    { 
      //console.log(JSON.stringify(rows));   
      res.status(200).json({'returnval': rows});
    }
    else
    {
      //console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

/*these functions are used to update and delete the discount types*/
app.post('/deletediscount' ,  urlencodedParser,function (req, res)
{  
   
    var qur="DELETE FROM  md_discounts where  discount_type='"+req.query.discountid+"'";
    console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
      res.status(200).json({'returnval': 'Deleted!'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'Not Deleted!'});
    }
    });
    
});


app.post('/updatediscount' ,  urlencodedParser,function (req, res)
{  
   
   var val=(req.query.discountname).toLowerCase();
   var qur="UPDATE  md_discounts SET discount_type_name='"+req.query.discountname+"', discount_type='"+val+"' where  discount_type='"+req.query.discountid+"'";
   //console.log(qur);
   connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
      res.status(200).json({'returnval': 'Updated!'});
    }
    else
    {
    //  console.log(err);
      res.status(200).json({'returnval': 'Not Updated!'});
    }
    });
    
});
  
app.post('/counsellorreport',  urlencodedParser,function (req, res){
  var queeyy="SELECT e.enquiry_name,e.enquiry_no,e.class,e.father_name,e.mother_name,e.father_mob,e.mother_mob, DATE_FORMAT(f.schedule_date,'%d/%m/%Y') AS schedule_date, f.followup_comments FROM student_enquiry_details as e JOIN followupdetail as f ON e.enquiry_no = f.enquiry_id  WHERE e.orginated_by = '"+req.query.counsellor+"' AND e.school_id = '"+req.query.schoolid+"'";
  connection.query(queeyy,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval':null});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/fetchallstudentforsearch-service',  urlencodedParser,function (req, res){
  var qur="SELECT distinct(admission_no),student_name FROM md_student_paidfee where school_id='"+req.query.schoolid+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/processbouncecheque-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_student_paidfee where school_id='"+req.query.schoolid+"' and (admission_no like '%"+req.query.searchvalue+"%' or cheque_no like '%"+req.query.searchvalue+"%') and mode_of_payment='Cheque' and cheque_status in('inprogress')";
  console.log('-------------------------------------------');
  console.log(qur);
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/fetchchequeforeditordelete-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_student_paidfee where school_id='"+req.query.schoolid+"' and (admission_no like '%"+req.query.searchvalue+"%' or cheque_no like '%"+req.query.searchvalue+"%') and mode_of_payment='Cheque'";
  console.log('-------------------------------------------');
  console.log(qur);
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/editcheque-Service',  urlencodedParser,function (req, res){
  var qur="UPDATE md_student_paidfee SET cheque_no='"+req.query.chequeno+"',bank_name='"+req.query.bankname+"',cheque_date='"+req.query.chequedate+"',installment_amount='"+req.query.amount+"',installment_date='"+req.query.chequedate+"' where school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and installment='"+req.query.installment+"' ";
  console.log('-------------------------------------------');
  console.log(qur);
  connection.query(qur,
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Updated!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/deletecheque-Service',  urlencodedParser,function (req, res){
  
  var qur="DELETE FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and cheque_no='"+req.query.chequeno+"' ";
  console.log('-------------------------------------------');
  console.log(qur);
  connection.query(qur,
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Deleted!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Deleted!'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/fetchstudentforsearch-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM student_enquiry_details where school_id='"+req.query.schoolid+"' and status='"+req.query.status+"'";
  console.log('-------------------------------');
  console.log(qur);
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/totalyearcount-enquiry', urlencodedParser,function(req, res){
  connection.query("select count(*) as totalcountyear FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyr+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
});

app.post('/totalmonthcount-enquiry', urlencodedParser,function(req, res){
    var querryyy="select count(*) as totalcountmonth FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' AND created_on like '"+req.query.currmonth+"'";
    //console.log(querryyy);
    connection.query(querryyy,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
});

 app.post('/totaldaycount-enquiry',  urlencodedParser,function (req, res){
  var querryyy="select count(*) as totalcountday FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' AND  created_on='"+req.query.todate+"'";
  //console.log(querryyy);
   connection.query(querryyy,
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

app.post('/totalprovisionaladmission',  urlencodedParser,function (req, res){
   connection.query("SELECT COUNT( * ) AS totalprovision FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND academic_year='"+req.query.academicyr+"' AND status='Provision'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
 });

app.post('/totaladmission',  urlencodedParser,function (req, res){
  connection.query("SELECT COUNT( * ) AS totaladmission FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND academic_year='"+req.query.academicyr+"' AND status='Admitted'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
});

app.post('/totalwithdrawals',  urlencodedParser,function (req, res){
  connection.query("SELECT COUNT( * ) AS totalwithdrawals FROM  student_enquiry_details WHERE `school_id` =  '"+req.query.schoolid+"' AND academic_year='"+req.query.academicyr+"' AND status='Withdrawn'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
});
app.post('/totalcapacity',  urlencodedParser,function (req, res){
  connection.query("select sum(max_capacity) as max_capacity from tr_current_capacity WHERE `school_id` =  '"+req.query.schoolid+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
});

app.post('/admissionsrequired',  urlencodedParser,function (req, res){
  connection.query("select sum(current_capacity) as current_capacity from tr_current_capacity WHERE `school_id` =  '"+req.query.schoolid+"'",
     function(err, rows)
     {
       if(!err)
       {
         if(rows.length>0)
         {
           //console.log(rows);
           res.status(200).json({'returnval': rows});
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
         }
       }
       else{
         console.log(err);
       }
     });
});


app.post('/fetchallstudentenquirysearch-service',  urlencodedParser,function (req, res){
  var qur="SELECT distinct(enquiry_no),enquiry_name FROM student_enquiry_details where school_id='"+req.query.schoolid+"' and status='Enquired'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/fetchallstudentadmissionsearch-service',  urlencodedParser,function (req, res){
  var qur="SELECT distinct(admission_no),enquiry_no,student_name,class_for_admission FROM md_admission where school_id='"+req.query.schoolid+"' ";

  console.log(qur);
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/fetchallstudentadmissionfeesearch-service',  urlencodedParser,function (req, res){
  var qur="SELECT distinct(admission_no),enquiry_no,student_name,class_for_admission FROM md_admission where school_id='"+req.query.schoolid+"' and discount_type not in('3')";

  console.log(qur);
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/fetchrtestudentadmissionsearch-service',  urlencodedParser,function (req, res){
  var qur="SELECT distinct(admission_no),student_name FROM md_admission where school_id='"+req.query.schoolid+"' and discount_type='3'";
  console.log(qur);
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});



app.post('/fetchstudentforpromotion-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.fromac+"' and class_for_admission='"+req.query.fromgrade+"'";
  console.log(qur);
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/promotioninsert-service',  urlencodedParser,function (req, res){
  // var qur1="SELECT * from md_admission where school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and academic_year='"+req.query.fromac+"' and admission_year!='"+req.query.toac+"' and class_for_admission='"+req.query.fromgrade+"'";
  var qur="INSERT INTO student_history SELECT * from md_admission where school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and academic_year='"+req.query.fromac+"' and class_for_admission='"+req.query.fromgrade+"' and admission_year!='"+req.query.toac+"'";
  // var qur3="UPDATE md_admission set academic_year='"+req.query.toac+"',class_for_admission='"+req.query.tograde+"',admission_status='Promoted' where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.fromac+"' and class_for_admission='"+req.query.fromgrade+"' and admission_year!='"+req.query.toac+"'";
  // console.log(qur1);
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  // console.log(qur3);
  connection.query(qur,function(err , result){
      if(!err){     
              if(result.affectedRows>0){
              res.status(200).json({'returnval': 'updated'});
              }
              else{
              res.status(200).json({'returnval': 'not updated'});
              }   
      }
    });
});

app.post('/promotionoldactonewac-service',  urlencodedParser,function (req, res){
  // var qur1="SELECT * from md_admission where school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and academic_year='"+req.query.fromac+"' and admission_year!='"+req.query.toac+"' and class_for_admission='"+req.query.fromgrade+"'";
  // var qur2="INSERT INTO student_history SELECT * from md_admission where school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and academic_year='"+req.query.fromac+"' and class_for_admission='"+req.query.fromgrade+"' and admission_year!='"+req.query.toac+"'";
  var qur="UPDATE md_admission set academic_year='"+req.query.toac+"',class_for_admission='"+req.query.tograde+"',admission_status='Promoted' where admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.fromac+"' and class_for_admission='"+req.query.fromgrade+"' and admission_year!='"+req.query.toac+"'";
  // console.log(qur1);
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  // console.log(qur3);
  connection.query(qur,function(err, result){
      if(!err){
              if(result.affectedRows>0){
              res.status(200).json({'returnval': 'updated'});
              }
              else{
              res.status(200).json({'returnval': 'not updated'});
              }              
            }
          });
});


app.post('/fetchallenrollmentsforsearch-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status!='Cancelled'";
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  // console.log(qur3);
  connection.query(qur,function(err, rows){
      if(!err){
              if(rows.length>0){
              res.status(200).json({'returnval': rows});
              }
              else{
              res.status(200).json({'returnval': 'no rows'});
              }              
            }
          });
});



app.post('/fetchstudentinfoforpreview-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_admission WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  // console.log(qur3);
  connection.query(qur,function(err, rows){
      if(!err){
              if(rows.length>0){
              res.status(200).json({'returnval': rows});
              }
              else{
              res.status(200).json({'returnval': 'no rows'});
              }              
            }
          });
});

app.post('/cancelenrollment-service',  urlencodedParser,function (req, res){
  var qur1="SELECT * FROM md_admission WHERE admission_no='"+req.query.admissionno+"' and class_for_admission='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  var qur2="UPDATE md_admission set active_status='Cancelled' where admission_no='"+req.query.admissionno+"' and class_for_admission='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  
  console.log('------------------------------------------------------');
  console.log(qur1);
  console.log('------------------------------------------------------');
  connection.query(qur1,function(err, rows){
      if(!err){
        if(rows.length==1){
              var enquiryno=rows[0].enquiry_no;
              var status=rows[0].active_status;
              console.log(enquiryno);
              connection.query(qur2,function(err, result){
              if(result.affectedRows>0){
                console.log('Coming for update!');
                if(status=='New'){
                var qur3="UPDATE student_enquiry_details set status='Cancelled' where enquiry_no='"+enquiryno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
                console.log(qur3);
                connection.query(qur3,function(err, result){
                  if(result.affectedRows>0){
                  var qur4="INSERT INTO md_tchistory select *,'"+req.query.reason+"' from md_admission where admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";  
                  connection.query(qur4,function(err, result){
                  if(result.affectedRows>0){
                  res.status(200).json({'returnval': 'Cancelled!'});
                  }
                  else
                  res.status(200).json({'returnval': 'Unable to Cancel!'}); 
                  });
                  }
                  });
                }
                else
                {
                  var qur4="INSERT INTO md_tchistory select *,'"+req.query.reason+"' from md_admission where admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";  
                  console.log(qur4);
                  connection.query(qur4,function(err, result){
                  if(!err&&result.affectedRows>0){
                  res.status(200).json({'returnval': 'Cancelled!'});
                  }
                  else{
                  console.log(err);
                  res.status(200).json({'returnval': 'Unable to Cancel!'}); 
                  }
                  });
                }
              }
              else{
              res.status(200).json({'returnval': 'not updated'});
              } 
              });             
        }
      }
          });
});


app.post('/fetchinfofortc-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_tchistory tc join md_student s on (tc.admission_no=s.admission_no) WHERE tc.admission_no='"+req.query.admissionno+"' and s.admission_no='"+req.query.admissionno+"' and tc.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and tc.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"'";
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  // console.log(qur3);
  connection.query(qur,function(err, rows){
      if(!err){
              if(rows.length>0){
              res.status(200).json({'returnval': rows});
              }
              else{
              res.status(200).json({'returnval': 'no rows'});
              }              
            }
          });
});


app.post('/fetchstructureallstudent-service',  urlencodedParser,function (req, res){
  console.log('ady..'+req.query.admissionyear);
  console.log('acy..'+req.query.academicyear);
  if(req.query.admissionyear=='All'&&req.query.grade=='All Grades')
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  else if(req.query.admissionyear=='All'&&req.query.grade!='All Grades')
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and class_for_admission='"+req.query.grade+"'"; 
  else if(req.query.admissionyear!='All'&&req.query.grade=='All Grades')
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"'";
  else
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and class_for_admission='"+req.query.grade+"'";  
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  // console.log(qur3);
  connection.query(qur,function(err, rows){
      if(!err){
              if(rows.length>0){
              res.status(200).json({'returnval': rows});
              }
              else{
              res.status(200).json({'returnval': 'no rows'});
              }              
            }
          });
});


app.post('/fetchgradewisefeestructure-service',  urlencodedParser,function (req, res){
  if(req.query.admissionyear=='All'&&req.query.grade=='All Grades')
  var qur="SELECT *,(SELECT grade_name from grade_master WHERE grade_id=f.grade_id) as grade FROM fee_master f WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' ";
  else if(req.query.admissionyear=='All'&&req.query.grade!='All Grades')
  var qur="SELECT *,(SELECT grade_name from grade_master WHERE grade_id=f.grade_id) as grade FROM fee_master f WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade_id=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"')";  
  else if(req.query.admissionyear!='All'&&req.query.grade=='All Grades')
  var qur="SELECT *,(SELECT grade_name from grade_master WHERE grade_id=f.grade_id) as grade FROM fee_master f WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"'";
  else
  var qur="SELECT *,(SELECT grade_name from grade_master WHERE grade_id=f.grade_id) as grade FROM fee_master f WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and grade_id=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"')";  
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  // console.log(qur3);
  connection.query(qur,function(err, rows){
      if(!err){
              if(rows.length>0){
              res.status(200).json({'returnval': rows});
              }
              else{
              res.status(200).json({'returnval': 'no rows'});
              }              
            }
          });
});


app.post('/fetchgradewisediscountstructure-service',  urlencodedParser,function (req, res){
  if(req.query.grade=='All Grades')
  var qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"'";
  else
  var qur="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and grade_id=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"')";  
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  // console.log(qur3);
  connection.query(qur,function(err, rows){
      if(!err){
              if(rows.length>0){
              res.status(200).json({'returnval': rows});
              }
              else{
              res.status(200).json({'returnval': 'no rows'});
              }              
            }
          });
});


app.post('/fetchallenrolledadmissions-service',  urlencodedParser,function (req, res){
  if(req.query.grade=='All Grades')
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"'";
  else
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.class_for_admission='"+req.query.grade+"' and s.class_for_admission='"+req.query.grade+"'";
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  // console.log(qur3);
  connection.query(qur,function(err, rows){
      if(!err){
              if(rows.length>0){
              res.status(200).json({'returnval': rows});
              }
              else{
              res.status(200).json({'returnval': 'no rows'});
              }              
            }
          });
});


app.post('/fetchtpstudentforsearch-service',  urlencodedParser,function (req, res){
  var qur="SELECT distinct(admission_no),student_name FROM md_student_paidfee where school_id='"+req.query.schoolid+"' and mode_of_payment='Third Party' and payment_through='thirdparty' and paid_status='inprogress'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/fetchtpstudinfo-service',  urlencodedParser,function (req, res){
  var qur="SELECT * from md_student_paidfee where school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"'and mode_of_payment='Third Party' and payment_through='thirdparty' and mode_of_payment='Third Party' and payment_through='thirdparty' and paid_status='inprogress'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/checkalreadyinspaid-service',  urlencodedParser,function (req, res){
  var qur="SELECT * from tp_realization_details where installment='"+req.query.installment+"' and school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/processtprealisation-service',  urlencodedParser,function (req, res){
  console.log('diffamount.......'+req.query.diffamount);
  if(req.query.diffamount=='0.00')
  var qur="UPDATE md_student_paidfee SET paid_status='paid',cheque_status='paid',realised_date='"+req.query.realiseddate+"',difference_amount='"+req.query.diffamount+"' "+
  " where school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and installment='"+req.query.installment+"'";
  else
  var qur="UPDATE md_student_paidfee SET difference_amount='"+req.query.diffamount+"' "+
  " where school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and installment='"+req.query.installment+"'";  
  var insertqur="INSERT INTO tp_realization_details SET ?";
  var response={
    school_id:req.query.schoolid,
    academic_year:req.query.academicyear,
    admission_no:req.query.admissionno,
    student_name:req.query.studentname,
    grade:req.query.grade,
    actual_amount:req.query.insamount,
    installment:req.query.dueinstallment,
    installment_date:req.query.realiseddate,
    installment_amount:req.query.amount,
    reference_no:req.query.refno,
    difference_amount:req.query.diffamount,
    created_By:req.query.createdby
  };

  var checkqur="SELECT * from tp_realization_details where installment='"+req.query.dueinstallment+"' and school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"'";
  connection.query(checkqur,function(err, rows){
  if(rows.length==0){
  connection.query(qur,function(err, result){
      if(!err){
        if(result.affectedRows>0){
          connection.query(insertqur,[response],function(err, result){
          if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Done!!'});
          }
          else
          res.status(200).json({'returnval': 'Unable to process!!'});  
          });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to process!!'});
        }
      } else {
        console.log(err);
      }
    });
  }
  else
  res.status(200).json({'returnval': 'Unable to process!!Already Done!'});  
});
});

app.post('/insertinstallmentsplitofstud',  urlencodedParser,function (req, res){
  console.log('insertinstallmentsplitofstud');
  var qur="INSERT INTO md_studentwise_installment_splitup SET ?";
  var response={
        school_id:req.query.schoolid,
        academic_year:req.query.academicyear,
        admission_no:req.query.admissionno,
        installment:req.query.installment,
        installment_amount:req.query.installmentamount,
        installment_date:req.query.installmentdate,
        actual_amount:req.query.actualamount,
        discount_amount:req.query.discountamount,
        feetype:req.query.feetype,
        feetype_actual_amount:req.query.feetypeactualamount,
        feetype_amount:req.query.feetypeamount,
        created_by:req.query.createdby
  };
  var checkqur="SELECT * FROM mlzscrm.md_studentwise_installment_splitup"+
  " WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
  " and admission_no='"+req.query.admissionno+"' and installment='"+req.query.installment+"' "+
  " and feetype='"+req.query.feetype+"'";
  console.log('-----------------------------');
  console.log(qur);
  console.log('-----------------------------');
  // connection.query(checkqur,
  // function(err, rows){
  // if(rows.length==0){
  connection.query(qur,[response],
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Done!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to process!!'});
        }
      } else {
        console.log(err);
      }
    });
    // }
    // else{
      // console.log('already thr!');
    // }
  // });
});


app.post('/fetchstudinstallmentsplitup',  urlencodedParser,function (req, res){
  console.log('fetchstudinstallmentsplitup');
  var qur="SELECT * FROM md_studentwise_installment_splitup WHERE "+
  " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.admissionno+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/insertstudwisefeesplitup',  urlencodedParser,function (req, res){
  console.log('insertstudwisefeesplitup');
  var qur="INSERT INTO md_studwise_fee_splitup SET ?";
  var response={
        school_id:req.query.schoolid,
        academic_year:req.query.academicyear,
        admission_no:req.query.admissionno,
        installment:req.query.installment,
        installment_amount:req.query.installmentamount,
        actual_amount:req.query.actualamount,
        discount_amount:req.query.discountamount,
        feetype:req.query.feetype,
        feetype_actual_amount:req.query.feetypeactualamount,
        feetype_amount:req.query.feetypeamount
  };

  connection.query(qur,[response],
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Done!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to process!!'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/fetchstudfeesplitup-service',  urlencodedParser,function (req, res){
  // console.log('fetchstudinstallmentsplitup');
  var qur="SELECT * FROM md_studwise_fee_splitup WHERE "+
  " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.admissionno+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/fetchdiscounttypes-service',  urlencodedParser,function (req, res){
  // console.log('fetchstudinstallmentsplitup');
  var qur="SELECT * FROM md_discount_type WHERE discount_type_id not in('4','5','6')";
  console.log(qur);
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/fetchstudenttoattachdiscount-service',  urlencodedParser,function (req, res){
  // console.log('fetchstudinstallmentsplitup');
  var qur="SELECT * FROM md_admission WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"'";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/attachdiscount-service',  urlencodedParser,function (req, res){
  // console.log('fetchstudinstallmentsplitup');
  var qur="update md_admission set referral_type='"+req.query.discountid+"' WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"'";
  connection.query(qur,
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Done!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to process!!'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/updateadhocdiscount-service',  urlencodedParser,function (req, res){
  // console.log('fetchstudinstallmentsplitup');
  var qur="update md_student_paidfee set adhoc_discount='"+req.query.amount+"',adhoc_feetype='"+req.query.feetype+"',adhoc_reason='"+req.query.reason+"' WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"'";
  console.log(qur);
  connection.query(qur,
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Done!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to process!!'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/updatelatefee-service',  urlencodedParser,function (req, res){
  // console.log('fetchstudinstallmentsplitup');
  var qur="update md_student_paidfee set latefee_amount='"+req.query.amount+"',latefee_date='"+req.query.latefeedate+"',latefee_reason='"+req.query.reason+"',latefee_paymentmode='"+req.query.paymentmode+"',latefee_refno='"+req.query.refno+"',latefee_bankname='"+req.query.bankname+"' WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and installment_type='"+req.query.installment+"'";
  console.log(qur);
  connection.query(qur,
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Done!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to process!!'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/deletestudwisefeesplitup-service',  urlencodedParser,function (req, res){
  var qur1="update md_student_paidfee set installment_pattern='"+req.query.installmentpattern+"' WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  var qur2="delete from md_studentwise_installment_splitup where admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  var qur3="delete from md_studwise_fee_splitup where admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'"
  console.log('----------------------');
  console.log(qur1);
  console.log(qur2);
  console.log(qur3);
  console.log('----------------------');
  connection.query(qur1,function(err, result){
      if(!err){        
          connection.query(qur2,function(err, result){
            connection.query(qur3,function(err, result){
              if(!err){
              res.status(200).json({'returnval': 'Deleted'});
              }
              else {
              console.log(err);
              res.status(200).json({'returnval': 'Unable to process!!'});
              }
            });
          });
      } else {
        console.log(err);
      }
    });
});

app.post('/fetchallstudentstructure-service',  urlencodedParser,function (req, res){
  var feestructure="SELECT *,(SELECT grade_name FROM grade_master WHERE grade_id=m.grade_id) as grade FROM fee_master m WHERE school_id='"+req.query.schoolid+"' order by fee_code";
  var groupstrucutre="select fee_code,fee_type,sum(amount) as amount from md_fee_splitup_master WHERE school_id='"+req.query.schoolid+"' group by fee_code,fee_type order by fee_code";
  var structure=[];
  var gr=[];
  connection.query(feestructure,function(err, rows){
  if(!err){
  structure=rows;
  connection.query(groupstrucutre,function(err, rows){
  if(!err){
  gr=rows;
  res.status(200).json({'structure':structure,'group':gr});
  }
  });
  }
  });
});

app.post('/processreport-service',  urlencodedParser,function (req, res){
   console.log('-------------------');
   console.log(req.query.grade+"   "+req.query.type);
   if(req.query.grade=='All Grades'){
    console.log('all grades...................');

   if(req.query.type=='All'){
   var paidqur = "select installment,installment_pattern,paymenttype_flag,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') group by school_id,admission_no,student_name,grade,installment_pattern,paymenttype_flag,installment";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in ('3') and pf.active_status not in ('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   }
   if(req.query.type=='New'){
    var paidqur = "select installment,installment_pattern,paymenttype_flag,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount   from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='New' group by school_id,admission_no,student_name,grade,installment_pattern,paymenttype_flag,installment";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and admission_status='New' and pf.discount_type not in ('3') and pf.active_status not in ('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   }
   if(req.query.type=='Promoted'){
    var paidqur = "select installment,installment_pattern,paymenttype_flag,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='Promoted' group by school_id,admission_no,student_name,grade,installment_pattern,paymenttype_flag,installment";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and admission_status='Promoted' and pf.discount_type not in ('3') and pf.active_status not in ('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   }
   var pendingqur = "select admission_no,student_name,grade,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status not in "+
   "('paid','cleared','inprogress') and cheque_status in('bounced','cancelled') group by school_id,admission_no,student_name,grade";
  }
  else{
    console.log('spec grades...................');
   // var totalqur = "select admission_no,student_name,grade,sum(actual_amount) as actualamount,sum(discount_amount) as discountamount,sum(installment_amount) as payableamount from "+
   // "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and cheque_status not in('bounced') group by school_id,admission_no,student_name,grade";
   if(req.query.type=='All'){
   var paidqur = "select installment,installment_pattern,paymenttype_flag,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount ,sum(difference_amount) as diffamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') group by school_id,admission_no,student_name,grade,,installment_pattern,paymenttype_flag,installment";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) "+
    " and pf.class_for_admission='"+req.query.grade+"' and pf.discount_type not in ('3') and pf.active_status not in ('Cancelled','Withdrawn') group by pf.admission_no" ;
   }
   if(req.query.type=='New'){
   var paidqur = "select installment,installment_pattern,paymenttype_flag,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='New' group by school_id,admission_no,student_name,grade,installment_pattern,paymenttype_flag,installment";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in ('3') and pf.active_status not in ('Cancelled','Withdrawn') "+
    " and pf.class_for_admission='"+req.query.grade+"' and admission_status='New' group by pf.admission_no" ;
   }
   if(req.query.type=='Promoted'){
   var paidqur = "select installment,installment_pattern,paymenttype_flag,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='Promoted' group by school_id,admission_no,student_name,grade,installment_pattern,paymenttype_flag,installment";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in ('3') and pf.active_status not in ('Cancelled','Withdrawn') "+
    " and pf.class_for_admission='"+req.query.grade+"' and admission_status='Promoted' group by pf.admission_no" ;
   }
   var pendingqur = "select admission_no,student_name,grade,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' AND school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and  paid_status not in "+
   "('paid','cleared','inprogress') and cheque_status in('bounced','cancelled') group by school_id,admission_no,student_name,grade";
   }
   var feesplitqur="SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   var inssplitqur="SELECT * FROM md_studentwise_installment_splitup WHERE school_id='"+req.query.schoolid+"'";
   console.log('-----------------------pending fee report--------------------------');
 console.log(totalqur);
 console.log('-------------------------------------------------');
  console.log(paidqur);
 console.log('-------------------------------------------------');
  console.log(pendingqur);
 console.log('-------------------------------------------------');
 var totalarr=[];
 var paidarr=[];
 // var pendingarr=[];
 var feesplit=[];
 var inssplit=[];
 var structure=[];
 var gr=[];
   connection.query(totalqur,function(err, rows){
       if(!err){         
          totalarr=rows;
          connection.query(paidqur,function(err, rows){
            if(!err){
              paidarr=rows;
              connection.query(inssplitqur,function(err, rows){
              if(!err){
              inssplit=rows;
              connection.query(feesplitqur,function(err, rows){
              if(!err){
              feesplit=rows;
              res.status(200).json({'totalarr':totalarr,'paidarr':paidarr,'inssplit':inssplit,'feesplit':feesplit});            
              }
              });
              }
              });
              }
              });
              }
              else{
              console.log(err);
              }
              });
 });

app.post('/duereport-service',  urlencodedParser,function (req, res){
if(req.query.grade=="All Grades"&&req.query.type=="All")
  var duequery="SELECT * FROM due_report WHERE school_id='"+req.query.schoolid+"'";
if(req.query.grade=="All Grades"&&req.query.type!="All")
  var duequery="SELECT * FROM due_report WHERE school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"'";
if(req.query.grade!="All Grades"&&req.query.type=="All")
  var duequery="SELECT * FROM due_report WHERE school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"'";
if(req.query.grade!="All Grades"&&req.query.type!="All")
  var duequery="SELECT * FROM due_report WHERE school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"'";

console.log(duequery);
  connection.query(duequery,function(err, rows){
  if(!err){
    res.status(200).json({'returnval':rows});  
  }
  else{
    console.log(err);
    res.status(200).json({'returnval':'no rows'});
  }
  });
});

 
 app.post('/fetchdailycollectiondashboard-service',  urlencodedParser,function (req, res){
  if(req.query.type=="All"&&req.query.grade=="All Grades"){
    console.log('1');
    var admncount="SELECT count(*) as totaladmissioncount FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and discount_type not in('3') and active_status not in ('Cancelled','Withdrawn')";
    var totalpaid="SELECT count(distinct(admission_no)) as totalpaidcount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled')";
    var totalpaidamount="SELECT sum(installment_amount) as totalpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled')";
    var patternpaid="SELECT installment_pattern,count(distinct(admission_no)) as patternadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled') group by installment_pattern";
    var patternpaidamount="SELECT installment_pattern,sum(installment_amount) as patternpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled') group by installment_pattern";
  }
  if(req.query.type=="All"&&req.query.grade!="All Grades"){
    console.log('2');
    var admncount="SELECT count(*) as totaladmissioncount  FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and discount_type not in('3') and active_status not in ('Cancelled','Withdrawn')";
    var totalpaid="SELECT count(distinct(admission_no)) as totalpaidcount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled')";
    var totalpaidamount="SELECT sum(installment_amount) as totalpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled')";
    var patternpaid="SELECT installment_pattern,count(distinct(admission_no))  as patternadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled') group by installment_pattern";
    var patternpaidamount="SELECT installment_pattern,sum(installment_amount) as patternpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled') group by installment_pattern";
  }
  if(req.query.type!="All"&&req.query.grade=="All Grades"){
    console.log('3');
    var admncount="SELECT count(*) as totaladmissioncount FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and discount_type not in('3') and active_status not in ('Cancelled','Withdrawn')";    
    var totalpaid="SELECT count(distinct(admission_no)) as totalpaidcount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled')";
    var totalpaidamount="SELECT sum(installment_amount) as totalpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled')";
    var patternpaid="SELECT installment_pattern,count(distinct(admission_no)) as patternadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled') group by installment_pattern";
    var patternpaidamount="SELECT installment_pattern,sum(installment_amount) as patternpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled') group by installment_pattern";
  }
  if(req.query.type!="All"&&req.query.grade!="All Grades"){
    console.log('4');
    var admncount="SELECT count(*) as totaladmissioncount FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"' and discount_type not in('3') and active_status not in ('Cancelled','Withdrawn')";    
    var totalpaid="SELECT count(distinct(admission_no)) as totalpaidcount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled')";
    var totalpaidamount="SELECT sum(installment_amount) as totalpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled')";
    var patternpaid="SELECT installment_pattern,count(distinct(admission_no))  as patternadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled') group by installment_pattern";
    var patternpaidamount="SELECT installment_pattern,sum(installment_amount) as patternpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment!='Application fee' and cheque_status not in('bounced','cancelled') group by installment_pattern";
  }
  console.log('.................total....................');
  console.log(admncount);
  console.log(totalpaid);
  console.log(totalpaidamount);
  console.log(patternpaid);
  console.log(patternpaidamount);
  console.log('.........................................');
  var admncountt=[];
  var totalpaidd=[];
  var totalpaidamountt=[];
  var patternpaidd=[];
  var patternpaidamountt=[];
  connection.query(admncount,function(err, rows){
  if(!err){
  admncountt=rows;
  connection.query(totalpaid,function(err, rows){
  if(!err){
  totalpaidd=rows;
  connection.query(totalpaidamount,function(err, rows){
  if(!err){
  totalpaidamountt=rows;
  connection.query(patternpaid,function(err, rows){
  if(!err){
  patternpaidd=rows;
  connection.query(patternpaidamount,function(err, rows){
  if(!err){
  patternpaidamountt=rows;
  res.status(200).json({'admncount':admncountt,'totalpaid':totalpaidd,'totalpaidamount':totalpaidamountt,'patternpaid':patternpaidd,'patternpaidamount':patternpaidamountt});  
  }
  else
    console.log(err);
  });
  }
  else
    console.log(err);
  });
  }
  else
    console.log(err);
  });
  }
  else
    console.log(err);
  });
  }
  else
    console.log(err);
  });
 });

app.post('/dailycollectionthirdpartydashboard-service',  urlencodedParser,function (req, res){
  if(req.query.type=="All"&&req.query.grade=="All Grades"){
    console.log('11');
    var neevpaid="SELECT count(distinct(admission_no)) as neevadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment!='Application fee' and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var neevpaidamount="SELECT sum(installment_amount) as neevpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment!='Application fee' and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var paytmpaid="SELECT count(distinct(admission_no)) as paytmadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment!='Application fee' and bank_name='paytm' ";
    var paytmpaidamount="SELECT sum(installment_amount) as paytmpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment!='Application fee' and bank_name='paytm' ";
  }
  if(req.query.type=="All"&&req.query.grade!="All Grades"){
    console.log('12');
    var neevpaid="SELECT count(distinct(admission_no)) as neevadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment!='Application fee' and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var neevpaidamount="SELECT sum(installment_amount) as neevpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment!='Application fee' and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var paytmpaid="SELECT count(distinct(admission_no)) as paytmadmncount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment!='Application fee' and bank_name='paytm' ";
    var paytmpaidamount="SELECT sum(installment_amount) as paytmpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment!='Application fee' and bank_name='paytm' ";
  }
  if(req.query.type!="All"&&req.query.grade=="All Grades"){
    console.log('13');
    var neevpaid="SELECT count(distinct(admission_no)) as neevadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment!='Application fee' and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var neevpaidamount="SELECT sum(installment_amount) as neevpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment!='Application fee' and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var paytmpaid="SELECT count(distinct(admission_no)) as paytmadmncount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment!='Application fee' and bank_name='paytm'";
    var paytmpaidamount="SELECT sum(installment_amount) as paytmpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment!='Application fee' and bank_name='paytm'";
  }
  if(req.query.type!="All"&&req.query.grade!="All Grades"){
    console.log('14');
    var neevpaid="SELECT count(distinct(admission_no)) as neevadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment!='Application fee' and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var neevpaidamount="SELECT sum(installment_amount) as neevpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment!='Application fee' and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var paytmpaid="SELECT count(distinct(admission_no)) as paytmadmncount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment!='Application fee' and bank_name='paytm'";
    var paytmpaidamount="SELECT sum(installment_amount) as paytmpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment!='Application fee' and bank_name='paytm'";
  }
  console.log('.................thirdparty...............');
  
  console.log(neevpaid);
  console.log(neevpaidamount);
  console.log(paytmpaid);
  console.log(paytmpaidamount);
  console.log('..........................................');
  var neevpaidd=[];
  var neevpaidamountt=[];
  var paytmpaidd=[];
  var paytmpaidamountt=[];

  connection.query(neevpaid,function(err, rows){
  if(!err){
  neevpaidd=rows;
  connection.query(neevpaidamount,function(err, rows){
  if(!err){
  neevpaidamountt=rows;
  connection.query(paytmpaid,function(err, rows){
  if(!err){
  paytmpaidd=rows;
  connection.query(paytmpaidamount,function(err, rows){
  if(!err){
  paytmpaidamountt=rows;
  res.status(200).json({'neevpaid':neevpaidd,'neevpaidamount':neevpaidamountt,'paytmpaid':paytmpaidd,'paytmpaidamount':paytmpaidamountt});  
  }
  else
    console.log(err);
  });
  }
  else
    console.log(err);
  });
  }
  else
    console.log(err);
  });
  }
  else
    console.log(err);
  });

 });

app.post('/updatedefaulter-service',  urlencodedParser,function (req, res){
  // console.log('fetchstudinstallmentsplitup');
  var qur="update md_admission set active_status='Admitted' WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"'";
  console.log(qur);
  connection.query(qur,
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Done!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to process!!'});
        }
      } else {
        console.log(err);
      }
    });
});


app.post('/fetchpreappinfo-service',  urlencodedParser,function (req, res){
  // console.log('fetchstudinstallmentsplitup');
  var qur="SELECT * FROM student_enquiry_details WHERE enquiry_no='"+req.query.enquiryno+"' and school_id='"+req.query.schoolid+"'";
  console.log(qur);
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/insertduereportstructure-service',  urlencodedParser,function (req, res){
  
  var response={
    school_id:req.query.schoolid,
    admission_no:req.query.admissionno,
    student_name:req.query.studentname,
    father_name:req.query.fathername,
    grade:req.query.grade,
    admission_status:req.query.admissionstatus,
    kitfee:req.query.kitfee,
    annualfee:req.query.annualfee,
    tutionfee:req.query.tutionfee,
    totalfee:req.query.total
  };

  // connection.query("DELETE FROM due_report",function(err, result){
  // if(!err){
  connection.query("INSERT INTO due_report SET ?",[response],
    function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Inserted!'});
      } else {
        console.log(err);
      }
    });
  // }
  // });
});


app.post('/duereportactualfeeupdate-service',  urlencodedParser,function (req, res){
  
        if(req.query.CommitmentFeeKitfee=="undefined")
        req.query.CommitmentFeeKitfee=0;
        if(req.query.CommitmentFeeAnnualfee=="undefined")
        req.query.CommitmentFeeAnnualfee=0;
        if(req.query.Installment1Annualfee=="undefined")
        req.query.Installment1Annualfee=0;
        if(req.query.Installment1Tutionfee=="undefined")
        req.query.Installment1Tutionfee=0;
        if(req.query.Installment2Annualfee=="undefined")
        req.query.Installment2Annualfee=0;
        if(req.query.Installment2Tutionfee=="undefined")
        req.query.Installment2Tutionfee=0;
        if(req.query.Installment3Annualfee=="undefined")
        req.query.Installment3Annualfee=0;
        if(req.query.Installment3Tutionfee=="undefined")
        req.query.Installment3Tutionfee=0;
        req.query.totalpaidfee=parseFloat(req.query.CommitmentFeeKitfee)+parseFloat(req.query.CommitmentFeeAnnualfee)+parseFloat(req.query.Installment1Annualfee)+parseFloat(req.query.Installment1Tutionfee)+parseFloat(req.query.Installment2Annualfee)+parseFloat(req.query.Installment2Tutionfee)+parseFloat(req.query.Installment3Annualfee)+parseFloat(req.query.Installment3Tutionfee);
  var response={
    actcommitkitfee:req.query.CommitmentFeeKitfee,
    actcommitannualfee:req.query.CommitmentFeeAnnualfee,
    actins1annualfee:req.query.Installment1Annualfee,
    actins1tutionfee:req.query.Installment1Tutionfee,
    actins2annualfee:req.query.Installment2Annualfee,
    actins2tutionfee:req.query.Installment2Tutionfee,
    actins3annualfee:req.query.Installment3Annualfee,
    actins3tutionfee:req.query.Installment3Tutionfee,
    acttotalpaidfee:req.query.totalpaidfee,
    pattern_flag:req.query.installmenttypeflag,
    commitinsflag:req.query.commitinsflag
  };

  var schoolid={school_id:req.query.schoolid};
  var admissionno={admission_no:req.query.admissionno};
  connection.query("UPDATE due_report set ? WHERE ? and ?",[response,schoolid,admissionno],
    function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
    });
});

app.post('/duereportupdatepaidfee-service',  urlencodedParser,function (req, res){
  
        if(req.query.CommitmentFeeKitfee=="undefined")
        req.query.CommitmentFeeKitfee=0;
        if(req.query.CommitmentFeeAnnualfee=="undefined")
        req.query.CommitmentFeeAnnualfee=0;
        if(req.query.Installment1Annualfee=="undefined")
        req.query.Installment1Annualfee=0;
        if(req.query.Installment1Tutionfee=="undefined")
        req.query.Installment1Tutionfee=0;
        if(req.query.Installment2Annualfee=="undefined")
        req.query.Installment2Annualfee=0;
        if(req.query.Installment2Tutionfee=="undefined")
        req.query.Installment2Tutionfee=0;
        if(req.query.Installment3Annualfee=="undefined")
        req.query.Installment3Annualfee=0;
        if(req.query.Installment3Tutionfee=="undefined")
        req.query.Installment3Tutionfee=0;
        req.query.totalpaidfee=parseFloat(req.query.CommitmentFeeKitfee)+parseFloat(req.query.CommitmentFeeAnnualfee)+parseFloat(req.query.Installment1Annualfee)+parseFloat(req.query.Installment1Tutionfee)+parseFloat(req.query.Installment2Annualfee)+parseFloat(req.query.Installment2Tutionfee)+parseFloat(req.query.Installment3Annualfee)+parseFloat(req.query.Installment3Tutionfee);
  var response={
    commitkitfee:req.query.CommitmentFeeKitfee,
    commitannualfee:req.query.CommitmentFeeAnnualfee,
    ins1annualfee:req.query.Installment1Annualfee,
    ins1tutionfee:req.query.Installment1Tutionfee,
    ins2annualfee:req.query.Installment2Annualfee,
    ins2tutionfee:req.query.Installment2Tutionfee,
    ins3annualfee:req.query.Installment3Annualfee,
    ins3tutionfee:req.query.Installment3Tutionfee,
    totalpaidfee:req.query.totalpaidfee
  };

  var schoolid={school_id:req.query.schoolid};
  var admissionno={admission_no:req.query.admissionno};
  connection.query("UPDATE due_report set ? WHERE ? and ?",[response,schoolid,admissionno],
    function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
    });
});


app.post('/duereportactualfeeupdate-service1',  urlencodedParser,function (req, res){
  
        if(req.query.CommitmentFeeKitfee=="undefined")
        req.query.CommitmentFeeKitfee=0;
        if(req.query.CommitmentFeeAnnualfee=="undefined")
        req.query.CommitmentFeeAnnualfee=0;
        if(req.query.Installment1Annualfee=="undefined")
        req.query.Installment1Annualfee=0;
        if(req.query.Installment1Tutionfee=="undefined")
        req.query.Installment1Tutionfee=0;
        if(req.query.Installment2Annualfee=="undefined")
        req.query.Installment2Annualfee=0;
        if(req.query.Installment2Tutionfee=="undefined")
        req.query.Installment2Tutionfee=0;
        if(req.query.Installment3Annualfee=="undefined")
        req.query.Installment3Annualfee=0;
        if(req.query.Installment3Tutionfee=="undefined")
        req.query.Installment3Tutionfee=0;
        req.query.totalpaidfee=parseFloat(req.query.CommitmentFeeKitfee)+parseFloat(req.query.CommitmentFeeAnnualfee)+parseFloat(req.query.Installment1Annualfee)+parseFloat(req.query.Installment1Tutionfee)+parseFloat(req.query.Installment2Annualfee)+parseFloat(req.query.Installment2Tutionfee)+parseFloat(req.query.Installment3Annualfee)+parseFloat(req.query.Installment3Tutionfee);
  var response={
    actcommitkitfee:req.query.CommitmentFeeKitfee,
    actcommitannualfee:req.query.CommitmentFeeAnnualfee,
    actins1annualfee:req.query.Installment1Annualfee,
    actins1tutionfee:req.query.Installment1Tutionfee,
    actins2annualfee:req.query.Installment2Annualfee,
    actins2tutionfee:req.query.Installment2Tutionfee,
    actins3annualfee:req.query.Installment3Annualfee,
    actins3tutionfee:req.query.Installment3Tutionfee,
    acttotalpaidfee:req.query.totalpaidfee,
    pattern_flag:req.query.installmenttypeflag
  };

  var schoolid={school_id:req.query.schoolid};
  var admissionno={admission_no:req.query.admissionno};
  connection.query("UPDATE due_report set ? WHERE ? and ?",[response,schoolid,admissionno],
    function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
    });
});


app.post('/duereportupdatelumpsumpaidfee-service',  urlencodedParser,function (req, res){
  
        if(req.query.CommitmentFeeKitfee=="undefined")
        req.query.CommitmentFeeKitfee=0;
        if(req.query.CommitmentFeeAnnualfee=="undefined")
        req.query.CommitmentFeeAnnualfee=0;
        if(req.query.Installment1Annualfee=="undefined")
        req.query.Installment1Annualfee=0;
        if(req.query.Installment1Tutionfee=="undefined")
        req.query.Installment1Tutionfee=0;
        if(req.query.Installment2Annualfee=="undefined")
        req.query.Installment2Annualfee=0;
        if(req.query.Installment2Tutionfee=="undefined")
        req.query.Installment2Tutionfee=0;
        if(req.query.Installment3Annualfee=="undefined")
        req.query.Installment3Annualfee=0;
        if(req.query.Installment3Tutionfee=="undefined")
        req.query.Installment3Tutionfee=0;
        req.query.totalpaidfee=parseFloat(req.query.CommitmentFeeKitfee)+parseFloat(req.query.CommitmentFeeAnnualfee)+parseFloat(req.query.Installment1Annualfee)+parseFloat(req.query.Installment1Tutionfee)+parseFloat(req.query.Installment2Annualfee)+parseFloat(req.query.Installment2Tutionfee)+parseFloat(req.query.Installment3Annualfee)+parseFloat(req.query.Installment3Tutionfee);
  var response={
    commitkitfee:req.query.CommitmentFeeKitfee,
    commitannualfee:req.query.CommitmentFeeAnnualfee,
    ins1annualfee:req.query.Installment1Annualfee,
    ins1tutionfee:req.query.Installment1Tutionfee,
    ins2annualfee:req.query.Installment2Annualfee,
    ins2tutionfee:req.query.Installment2Tutionfee,
    ins3annualfee:req.query.Installment3Annualfee,
    ins3tutionfee:req.query.Installment3Tutionfee,
    totalpaidfee:req.query.totalpaidfee,
    duecommitkitfee:0,
    duecommitannualfee:0,
    dueins1annualfee:0,
    dueins1tutionfee:0,
    dueins2annualfee:0,
    dueins2tutionfee:0,
    dueins3annualfee:0,
    dueins3tutionfee:0,
    duetotalpaidfee:0
  };

  var schoolid={school_id:req.query.schoolid};
  var admissionno={admission_no:req.query.admissionno};
  connection.query("UPDATE due_report set ? WHERE ? and ?",[response,schoolid,admissionno],
    function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
    });
});

app.post('/duereportupdatelumpsumpaidfee-service1',  urlencodedParser,function (req, res){
  
        if(req.query.CommitmentFeeKitfee=="undefined")
        req.query.CommitmentFeeKitfee=0;
        if(req.query.CommitmentFeeAnnualfee=="undefined")
        req.query.CommitmentFeeAnnualfee=0;
        if(req.query.Installment1Annualfee=="undefined")
        req.query.Installment1Annualfee=0;
        if(req.query.Installment1Tutionfee=="undefined")
        req.query.Installment1Tutionfee=0;
        if(req.query.Installment2Annualfee=="undefined")
        req.query.Installment2Annualfee=0;
        if(req.query.Installment2Tutionfee=="undefined")
        req.query.Installment2Tutionfee=0;
        if(req.query.Installment3Annualfee=="undefined")
        req.query.Installment3Annualfee=0;
        if(req.query.Installment3Tutionfee=="undefined")
        req.query.Installment3Tutionfee=0;
        req.query.totalpaidfee=parseFloat(req.query.CommitmentFeeKitfee)+parseFloat(req.query.CommitmentFeeAnnualfee)+parseFloat(req.query.Installment1Annualfee)+parseFloat(req.query.Installment1Tutionfee)+parseFloat(req.query.Installment2Annualfee)+parseFloat(req.query.Installment2Tutionfee)+parseFloat(req.query.Installment3Annualfee)+parseFloat(req.query.Installment3Tutionfee);
  var response={
    commitkitfee:req.query.CommitmentFeeKitfee,
    commitannualfee:req.query.CommitmentFeeAnnualfee,
    ins1annualfee:req.query.Installment1Annualfee,
    ins1tutionfee:req.query.Installment1Tutionfee,
    ins2annualfee:req.query.Installment2Annualfee,
    ins2tutionfee:req.query.Installment2Tutionfee,
    ins3annualfee:req.query.Installment3Annualfee,
    ins3tutionfee:req.query.Installment3Tutionfee,
    totalpaidfee:req.query.totalpaidfee,
    duecommitkitfee:0,
    duecommitannualfee:0,
    dueins1annualfee:0,
    dueins1tutionfee:0,
    dueins2annualfee:0,
    dueins2tutionfee:0,
    dueins3annualfee:0,
    dueins3tutionfee:0,
    duetotalpaidfee:0
  };

  var schoolid={school_id:req.query.schoolid};
  var admissionno={admission_no:req.query.admissionno};
  connection.query("UPDATE due_report set ? WHERE ? and ?",[response,schoolid,admissionno],
    function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
    });
});

app.post('/duereportupdatelumpsumpaidfee-service2',  urlencodedParser,function (req, res){
  
        if(req.query.CommitmentFeeKitfee=="undefined")
        req.query.CommitmentFeeKitfee=0;
        if(req.query.CommitmentFeeAnnualfee=="undefined")
        req.query.CommitmentFeeAnnualfee=0;
        if(req.query.Installment1Annualfee=="undefined")
        req.query.Installment1Annualfee=0;
        if(req.query.Installment1Tutionfee=="undefined")
        req.query.Installment1Tutionfee=0;
        if(req.query.Installment2Annualfee=="undefined")
        req.query.Installment2Annualfee=0;
        if(req.query.Installment2Tutionfee=="undefined")
        req.query.Installment2Tutionfee=0;
        if(req.query.Installment3Annualfee=="undefined")
        req.query.Installment3Annualfee=0;
        if(req.query.Installment3Tutionfee=="undefined")
        req.query.Installment3Tutionfee=0;
        req.query.totalpaidfee=parseFloat(req.query.CommitmentFeeKitfee)+parseFloat(req.query.CommitmentFeeAnnualfee)+parseFloat(req.query.Installment1Annualfee)+parseFloat(req.query.Installment1Tutionfee)+parseFloat(req.query.Installment2Annualfee)+parseFloat(req.query.Installment2Tutionfee)+parseFloat(req.query.Installment3Annualfee)+parseFloat(req.query.Installment3Tutionfee);
  var response={
    commitkitfee:req.query.CommitmentFeeKitfee,
    commitannualfee:req.query.CommitmentFeeAnnualfee,
    ins1annualfee:req.query.Installment1Annualfee,
    ins1tutionfee:req.query.Installment1Tutionfee,
    ins2annualfee:req.query.Installment2Annualfee,
    ins2tutionfee:req.query.Installment2Tutionfee,
    ins3annualfee:req.query.Installment3Annualfee,
    ins3tutionfee:req.query.Installment3Tutionfee,
    totalpaidfee:req.query.totalpaidfee,
    duecommitkitfee:0,
    duecommitannualfee:0,
    dueins1annualfee:0,
    dueins1tutionfee:0,
    dueins2annualfee:0,
    dueins2tutionfee:0,
    dueins3annualfee:0,
    dueins3tutionfee:0,
    duetotalpaidfee:0
  };

  var schoolid={school_id:req.query.schoolid};
  var admissionno={admission_no:req.query.admissionno};
  connection.query("UPDATE due_report set ? WHERE ? and ?",[response,schoolid,admissionno],
    function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
    });
});


app.post('/duereportupdatecustomstandardpaidfee-service',  urlencodedParser,function (req, res){
  
        if(req.query.CommitmentFeeKitfee=="undefined")
        req.query.CommitmentFeeKitfee=0;
        if(req.query.CommitmentFeeAnnualfee=="undefined")
        req.query.CommitmentFeeAnnualfee=0;
        if(req.query.Installment1Annualfee=="undefined")
        req.query.Installment1Annualfee=0;
        if(req.query.Installment1Tutionfee=="undefined")
        req.query.Installment1Tutionfee=0;
        if(req.query.Installment2Annualfee=="undefined")
        req.query.Installment2Annualfee=0;
        if(req.query.Installment2Tutionfee=="undefined")
        req.query.Installment2Tutionfee=0;
        if(req.query.Installment3Annualfee=="undefined")
        req.query.Installment3Annualfee=0;
        if(req.query.Installment3Tutionfee=="undefined")
        req.query.Installment3Tutionfee=0;
        req.query.totalpaidfee=parseFloat(req.query.CommitmentFeeKitfee)+parseFloat(req.query.CommitmentFeeAnnualfee)+parseFloat(req.query.Installment1Annualfee)+parseFloat(req.query.Installment1Tutionfee)+parseFloat(req.query.Installment2Annualfee)+parseFloat(req.query.Installment2Tutionfee)+parseFloat(req.query.Installment3Annualfee)+parseFloat(req.query.Installment3Tutionfee);
  var response={
    commitkitfee:req.query.CommitmentFeeKitfee,
    commitannualfee:req.query.CommitmentFeeAnnualfee,
    ins1annualfee:req.query.Installment1Annualfee,
    ins1tutionfee:req.query.Installment1Tutionfee,
    ins2annualfee:req.query.Installment2Annualfee,
    ins2tutionfee:req.query.Installment2Tutionfee,
    ins3annualfee:req.query.Installment3Annualfee,
    ins3tutionfee:req.query.Installment3Tutionfee,
    totalpaidfee:req.query.totalpaidfee
  };

  var schoolid={school_id:req.query.schoolid};
  var admissionno={admission_no:req.query.admissionno};
  connection.query("UPDATE due_report set ? WHERE ? and ?",[response,schoolid,admissionno],
    function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
    });
});

app.post('/duereportdueupdatecustomstandardaidfee-service',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var updatequery="UPDATE due_report SET duecommitkitfee=(actcommitkitfee-commitkitfee),duecommitannualfee=(actcommitannualfee-commitannualfee),dueins1annualfee=(actins1annualfee-ins1annualfee),dueins1tutionfee=(actins1tutionfee-ins1tutionfee), "+
  " dueins2annualfee=(actins2annualfee-ins2annualfee),dueins2tutionfee=(actins2tutionfee-ins2tutionfee),dueins3annualfee=(actins3annualfee-ins3annualfee),dueins3tutionfee=(actins3tutionfee-ins3tutionfee),duetotalpaidfee=(acttotalpaidfee-totalpaidfee) WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"'"; 

  connection.query(updatequery,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
  });

});


app.post('/duereportdiscountcustomstandardupdate-service',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var updatequery="update due_report set discountkitfee=(kitfee-(actcommitkitfee)), "+
  "discountannualfee=(annualfee-(actcommitannualfee+actins1annualfee+actins2annualfee+actins3annualfee)), "+
  "discounttutionfee=(tutionfee-(actins1tutionfee+actins2tutionfee+actins3tutionfee)),discounttotal=(discountkitfee+discountannualfee+discounttutionfee) WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"'";
  console.log('-----------discount update-------------');
  console.log(updatequery); 
  connection.query(updatequery,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
  });

});


app.post('/duereportdueupdate-service',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var updatequery="UPDATE due_report SET duecommitkitfee=(actcommitkitfee-commitkitfee),duecommitannualfee=(actcommitannualfee-commitannualfee),dueins1annualfee=(actins1annualfee-ins1annualfee),dueins1tutionfee=(actins1tutionfee-ins1tutionfee), "+
  " dueins2annualfee=(actins2annualfee-ins2annualfee),dueins2tutionfee=(actins2tutionfee-ins2tutionfee),dueins3annualfee=(actins3annualfee-ins3annualfee),dueins3tutionfee=(actins3tutionfee-ins3tutionfee),duetotalpaidfee=(acttotalpaidfee-totalpaidfee) WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"'"; 
  // var updatequery2="UPDATE due_report SET duecommitkitfee=(actcommitkitfee-commitkitfee),duecommitannualfee=(actcommitannualfee-commitannualfee),dueins1annualfee=(actins1annualfee-ins1annualfee),dueins1tutionfee=(actins1tutionfee-ins1tutionfee), "+
  // " dueins2annualfee=(actins2annualfee-ins2annualfee),dueins2tutionfee=(actins2tutionfee-ins2tutionfee),dueins3annualfee=(actins3annualfee-ins3annualfee),dueins3tutionfee=(actins3tutionfee-ins3tutionfee),duetotalpaidfee=(acttotalpaidfee-totalpaidfee) WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"' and commitinsflag='0'";
  connection.query(updatequery,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
  });

});

app.post('/duereportdiscountupdate-service',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var updatequery="update due_report set discountkitfee=(kitfee-(actcommitkitfee)), "+
  "discountannualfee=(annualfee-(actcommitannualfee+actins1annualfee+actins2annualfee+actins3annualfee)), "+
  "discounttutionfee=(tutionfee-(actins1tutionfee+actins2tutionfee+actins3tutionfee)),discounttotal=(discountkitfee+discountannualfee+discounttutionfee) WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"'";

  var qur1="UPDATE due_report SET duecommitkitfee=(duecommitkitfee-discountkitfee),duecommitannualfee=(discountannualfee-duecommitannualfee),duetotalpaidfee=(acttotalpaidfee-totalpaidfee+duecommitannualfee+duecommitkitfee) WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"' and commitinsflag='1'"; 
  var qur2="UPDATE due_report SET discountkitfee=0,discountannualfee=0,discounttutionfee=0,discounttotal=0 WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"' and commitinsflag='1'";
  
  console.log('-----------discount update-------------');
  console.log(updatequery); 
  connection.query(updatequery,function(err, result){
      if(!err){ 
      connection.query(qur1,function(err, result){
      if(!err){ 
      connection.query(qur2,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      }
      });
      }
      });
      } else {
        console.log(err);
      }
  });

});

app.post('/duereportdiscountlumpsumupdate-service',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var updatequery="update mlzscrm.due_report set discountkitfee=(kitfee-(commitkitfee)), "+
  "discountannualfee=(annualfee-(commitannualfee+ins1annualfee+ins2annualfee+ins3annualfee)), "+
  "discounttutionfee=(tutionfee-(ins1tutionfee+ins2tutionfee+ins3tutionfee)),discounttotal=(discountkitfee+discountannualfee+discounttutionfee) WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"'";
  console.log('-----------discount update-------------');
  console.log(updatequery); 
  connection.query(updatequery,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
  });

});

app.post('/duereportdiscountlumpsumupdate-service1',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var updatequery="update mlzscrm.due_report set discountkitfee=(kitfee-(commitkitfee)), "+
  "discountannualfee=(annualfee-(commitannualfee+ins1annualfee+ins2annualfee+ins3annualfee)), "+
  "discounttutionfee=(tutionfee-(ins1tutionfee+ins2tutionfee+ins3tutionfee)),discounttotal=(discountkitfee+discountannualfee+discounttutionfee) WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"'";
  console.log('-----------discount update-------------');
  console.log(updatequery); 
  connection.query(updatequery,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
  });

});

app.post('/duereportdiscountlumpsumupdate-service2',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var updatequery="update mlzscrm.due_report set discountkitfee=(kitfee-(commitkitfee)), "+
  "discountannualfee=(annualfee-(commitannualfee+ins1annualfee+ins2annualfee+ins3annualfee)), "+
  "discounttutionfee=(tutionfee-(ins1tutionfee+ins2tutionfee+ins3tutionfee)),discounttotal=(discountkitfee+discountannualfee+discounttutionfee) WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"'";
  console.log('-----------discount update-------------');
  console.log(updatequery); 
  connection.query(updatequery,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
  });

});


app.post('/updatenonpaidfee-service',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var updatequery="update mlzscrm.due_report set discountkitfee='0',discountannualfee='0',discounttutionfee='0',discounttotal='0', "+
  " commitkitfee='0',commitannualfee='0',ins1annualfee='0',ins1tutionfee='0', "+
  " ins2annualfee='0',ins2tutionfee='0',ins3annualfee='0',ins3tutionfee='0', "+
  " WHERE school_id='"+req.query.schoolid+"' and pattern_flag='"+req.query.installmenttypeflag+"'";
  console.log('-----------discount update-------------');
  console.log(updatequery); 
  connection.query(updatequery,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
  });

});


app.post('/fetchfeestructureforcustompattern-service',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var qur1="SELECT * FROM md_admission WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";

  var qur2="SELECT *,(select grade_name from grade_master where grade_id=grade) as gradename FROM mlzscrm.md_fee_splitup_master where school_id='"+req.query.schoolid+"'";

 console.log('-----------custom pattern-------------');
  console.log(qur1);
  console.log(qur2);
  var admnarr=[];
  var splitarr=[]; 
  connection.query(qur1,function(err, rows){
      if(!err){ 
        admnarr=rows;
      connection.query(qur2,function(err, rows){
      if(!err){   
        splitarr=rows;
        res.status(200).json({'admnarr': admnarr,'splitarr': splitarr});
      }
      });
      } else {
        console.log(err);
      }
  });

});

app.post('/fetchfeestructureforcustompattern-service1',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};

  var qur1="SELECT * FROM md_admission WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";

  var qur2="SELECT *,(select grade_name from grade_master where grade_id=grade) as gradename FROM mlzscrm.md_fee_splitup_master where school_id='"+req.query.schoolid+"'";

 console.log('-----------custom pattern-------------');
  console.log(qur1);
  console.log(qur2);
  var admnarr=[];
  var splitarr=[]; 
  connection.query(qur1,function(err, rows){
      if(!err){ 
        admnarr=rows;
      connection.query(qur2,function(err, rows){
      if(!err){   
        splitarr=rows;
        res.status(200).json({'admnarr': admnarr,'splitarr': splitarr});
      }
      });
      } else {
        console.log(err);
      }
  });

});


app.post('/enquiryconversionreport-service',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};
  var gradequery="SELECT * FROM grade_master";
  var queryy="SELECT class,MONTHNAME(STR_TO_DATE(enquired_date,'%m/%d/%Y')) as month, "+
  "EXTRACT(YEAR FROM STR_TO_DATE(enquired_date,'%m/%d/%Y')) as year, "+
  "count(enquiry_no) as enqcount,status "+
  "from mlzscrm.student_enquiry_details where status='Enquired' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and enquired_date is not null "+
  "group by MONTHNAME(STR_TO_DATE(enquired_date,'%m/%d/%Y')),status,class";
  console.log('-----------enquiry conversion report-------------');
  console.log(queryy); 
  var gradearr=[];
  connection.query(gradequery,function(err, rows){
  if(!err){
  gradearr=rows;
  connection.query(queryy,function(err, rows){
      if(!err){   
        res.status(200).json({'gradearr':gradearr,'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
  }
  else{
    res.status(200).json({'returnval': 'no rows'});
  }
  });
});

app.post('/enquiryconversionreport-service1',  urlencodedParser,function (req, res){

  var schoolid={school_id:req.query.schoolid};
  var gradequery="SELECT * FROM grade_master";
  var queryy="SELECT class,MONTHNAME(STR_TO_DATE(enquired_date,'%m/%d/%Y')) as month, "+
  "EXTRACT(YEAR FROM STR_TO_DATE(enquired_date,'%m/%d/%Y')) as year, "+
  "count(enquiry_no) as enqcount,status "+
  "from mlzscrm.student_enquiry_details where status='Admitted' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and enquired_date is not null "+
  "group by MONTHNAME(STR_TO_DATE(enquired_date,'%m/%d/%Y')),status,class";
  console.log('-----------enquiry conversion report-------------');
  console.log(queryy); 
  var gradearr=[];
  connection.query(gradequery,function(err, rows){
  if(!err){
  gradearr=rows;
  connection.query(queryy,function(err, rows){
      if(!err){   
        res.status(200).json({'gradearr':gradearr,'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
  }
  else{
    res.status(200).json({'returnval': 'no rows'});
  }
  });
});

app.post('/fetchschool-service',  urlencodedParser,function (req, res){
  var queryy="SELECT * FROM md_school";
  console.log('-----------school report-------------');
  console.log(queryy); 
  var gradearr=[];

  connection.query(queryy,function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
 
});

app.post('/fetchcollectiondashboardinfo-service',  urlencodedParser,function (req, res){
  // var qur1="SELECT class_for_admission,count(admission_no) FROM md_admission WHERE school_id='"+req.query.schoolid+"' group by class_for_admission";
  if(req.query.type=="All"&&req.query.grade=="All Grades"){
  var totalqur="SELECT grade,count(*) as cnt,sum(totalfee) as total FROM mlzscrm.due_report where "+
  "school_id='"+req.query.schoolid+"' and totalpaidfee is not null group by grade order by grade";
  var commitqur="select grade,count(*) as cnt,sum(commitkitfee+commitannualfee) as total from due_report where school_id='"+req.query.schoolid+"' and "+
  " duecommitkitfee=0 or duecommitannualfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins1qur="select grade,count(*) as cnt,sum(ins1annualfee+ins1tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and "+
  " dueins1annualfee=0 and dueins1tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins2qur="select grade,count(*) as cnt,sum(ins2annualfee+ins2tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and "+
  " dueins2annualfee=0 and dueins2tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins3qur="select grade,count(*) as cnt,sum(ins3annualfee+ins3tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and "+
  " dueins3annualfee=0 and dueins3tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  }
  if(req.query.type!="All"&&req.query.grade=="All Grades"){
  var totalqur="SELECT grade,count(*) as cnt,sum(totalfee) as total FROM mlzscrm.due_report where "+
  "school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and totalpaidfee is not null group by grade order by grade";
  var commitqur="select grade,count(*) as cnt,sum(commitkitfee+commitannualfee) as total from due_report where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and "+
  " duecommitkitfee=0 or duecommitannualfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins1qur="select grade,count(*) as cnt,sum(ins1annualfee+ins1tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and "+
  " dueins1annualfee=0 and dueins1tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins2qur="select grade,count(*) as cnt,sum(ins2annualfee+ins2tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and "+
  " dueins2annualfee=0 and dueins2tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins3qur="select grade,count(*) as cnt,sum(ins3annualfee+ins3tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and "+
  " dueins3annualfee=0 and dueins3tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  }
  if(req.query.type=="All"&&req.query.grade!="All Grades"){
  var totalqur="SELECT grade,count(*) as cnt,sum(totalfee) as total FROM mlzscrm.due_report where "+
  "school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and totalpaidfee is not null group by grade order by grade";
  var commitqur="select grade,count(*) as cnt,sum(commitkitfee+commitannualfee) as total from due_report where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and "+
  " duecommitkitfee=0 or duecommitannualfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins1qur="select grade,count(*) as cnt,sum(ins1annualfee+ins1tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and "+
  " dueins1annualfee=0 and dueins1tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins2qur="select grade,count(*) as cnt,sum(ins2annualfee+ins2tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and "+
  " dueins2annualfee=0 and dueins2tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins3qur="select grade,count(*) as cnt,sum(ins3annualfee+ins3tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and "+
  " dueins3annualfee=0 and dueins3tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  }
  if(req.query.type!="All"&&req.query.grade!="All Grades"){
  var totalqur="SELECT grade,count(*) as cnt,sum(totalfee) as total FROM mlzscrm.due_report where "+
  "school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and admission_status='"+req.query.type+"' and totalpaidfee is not null group by grade order by grade";
  var commitqur="select grade,count(*) as cnt,sum(commitkitfee+commitannualfee) as total from due_report where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and admission_status='"+req.query.type+"' and "+
  " duecommitkitfee=0 or duecommitannualfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins1qur="select grade,count(*) as cnt,sum(ins1annualfee+ins1tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and admission_status='"+req.query.type+"' and "+
  " dueins1annualfee=0 and dueins1tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins2qur="select grade,count(*) as cnt,sum(ins2annualfee+ins2tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and admission_status='"+req.query.type+"' and "+
  " dueins2annualfee=0 and dueins2tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  var ins3qur="select grade,count(*) as cnt,sum(ins3annualfee+ins3tutionfee) as total from due_report where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and admission_status='"+req.query.type+"' and "+
  " dueins3annualfee=0 and dueins3tutionfee=0 and totalpaidfee is not null group by grade order by grade";
  }
  console.log('-----------school report-------------');
  console.log(totalqur); 
  console.log('-------------------------------------');
  console.log(commitqur); 
  console.log('-------------------------------------');
  console.log(ins1qur); 
  console.log('-------------------------------------');
  console.log(ins2qur); 
  console.log('-------------------------------------');
  console.log(ins3qur); 
  var total=[];
  var commit=[];
  var ins1=[];
  var ins2=[];
  var ins3=[];

  connection.query(totalqur,function(err, rows){
      if(!err){ 
      total=rows; 
      connection.query(commitqur,function(err, rows){ 
        if(!err){ 
        commit=rows; 
        connection.query(ins1qur,function(err, rows){ 
        if(!err){  
        ins1=rows;
        connection.query(ins2qur,function(err, rows){ 
        if(!err){  
        ins2=rows;  
        connection.query(ins3qur,function(err, rows){
        if(!err){ 
        ins3=rows;
        res.status(200).json({'total':total,'commit':commit,'ins1':ins1,'ins2':ins2,'ins3':ins3});
        }
        else
          console.log(err);
        });
        }
        else
          console.log(err);
        });
        }
        else
          console.log(err);
        });
        }
        else
          console.log(err);
      });
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
 
});


app.post('/fetchcollectiondashboarddueinfo-service',  urlencodedParser,function (req, res){
  // var qur1="SELECT class_for_admission,count(admission_no) FROM md_admission WHERE school_id='"+req.query.schoolid+"' group by class_for_admission";
  // console.log('-----------school report-------------');
  // console.log(totalqur); 
  if(req.query.type=="All"&&req.query.grade=="All Grades"){
  var commitqur="select grade,count(*) as cnt,sum(duecommitkitfee+duecommitannualfee) as total from due_report "+
  " where school_id='"+req.query.schoolid+"' and (duecommitkitfee>0) or (duecommitannualfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins1qur="select grade,count(*) as cnt,sum(dueins1annualfee+dueins1tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and (dueins1annualfee>0) or (dueins1tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins2qur="select grade,count(*) as cnt,sum(dueins2annualfee+dueins2tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and (dueins2annualfee>0) or (dueins2tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins3qur="select grade,count(*) as cnt,sum(dueins3annualfee+dueins3tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and (dueins3annualfee>0) or (dueins3tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  }
  if(req.query.type!="All"&&req.query.grade=="All Grades"){
  var commitqur="select grade,count(*) as cnt,sum(duecommitkitfee+duecommitannualfee) as total from due_report "+
  " where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and (duecommitkitfee>0) or (duecommitannualfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins1qur="select grade,count(*) as cnt,sum(dueins1annualfee+dueins1tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and (dueins1annualfee>0) or (dueins1tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins2qur="select grade,count(*) as cnt,sum(dueins2annualfee+dueins2tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and (dueins2annualfee>0) or (dueins2tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins3qur="select grade,count(*) as cnt,sum(dueins3annualfee+dueins3tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and (dueins3annualfee>0) or (dueins3tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  }
  if(req.query.type=="All"&&req.query.grade!="All Grades"){
  var commitqur="select grade,count(*) as cnt,sum(duecommitkitfee+duecommitannualfee) as total from due_report "+
  " where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and (duecommitkitfee>0) or (duecommitannualfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins1qur="select grade,count(*) as cnt,sum(dueins1annualfee+dueins1tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and (dueins1annualfee>0) or (dueins1tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins2qur="select grade,count(*) as cnt,sum(dueins2annualfee+dueins2tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and (dueins2annualfee>0) or (dueins2tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins3qur="select grade,count(*) as cnt,sum(dueins3annualfee+dueins3tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and (dueins3annualfee>0) or (dueins3tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  }
  if(req.query.type!="All"&&req.query.grade!="All Grades"){
  var commitqur="select grade,count(*) as cnt,sum(duecommitkitfee+duecommitannualfee) as total from due_report "+
  " where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"' and (duecommitkitfee>0) or (duecommitannualfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins1qur="select grade,count(*) as cnt,sum(dueins1annualfee+dueins1tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"' and (dueins1annualfee>0) or (dueins1tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins2qur="select grade,count(*) as cnt,sum(dueins2annualfee+dueins2tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"' and (dueins2annualfee>0) or (dueins2tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  var ins3qur="select grade,count(*) as cnt,sum(dueins3annualfee+dueins3tutionfee) as total  from due_report "+
  " where school_id='"+req.query.schoolid+"' and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"' and (dueins3annualfee>0) or (dueins3tutionfee>0) and totalpaidfee is not null "+
  " group by grade order by grade";
  }
  console.log('-------------------------------------');
  console.log(commitqur); 
  console.log('-------------------------------------');
  console.log(ins1qur); 
  console.log('-------------------------------------');
  console.log(ins2qur); 
  console.log('-------------------------------------');
  console.log(ins3qur); 
  var total=[];
  var commit=[];
  var ins1=[];
  var ins2=[];
  var ins3=[];

  // connection.query(totalqur,function(err, rows){
      // if(!err){ 
      // total=rows; 
      connection.query(commitqur,function(err, rows){ 
        if(!err){ 
        commit=rows; 
        connection.query(ins1qur,function(err, rows){ 
        if(!err){  
        ins1=rows;
        connection.query(ins2qur,function(err, rows){ 
        if(!err){  
        ins2=rows;  
        connection.query(ins3qur,function(err, rows){
        if(!err){ 
        ins3=rows;
        res.status(200).json({'commit':commit,'ins1':ins1,'ins2':ins2,'ins3':ins3});
        }
        else
          console.log(err);
        });
        }
        else
          console.log(err);
        });
        }
        else
          console.log(err);
        });
        }
        else
          console.log(err);
      });
      // } else {
        // console.log(err);
        // res.status(200).json({'returnval': 'no rows'});
      // }
  // });
 
});

app.post('/fetchproof-service',  urlencodedParser,function (req, res){
  var queryy="SELECT * FROM md_proof";
  console.log('-----------school Proof-------------');
  console.log(queryy); 
  
  connection.query(queryy,function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
 
});

app.post('/updateproof-service',  urlencodedParser,function (req, res){
  var queryy="INSERT INTO mp_student_proof SET ?";
  var response={
    school_id:req.query.schoolid,
    academic_year:req.query.academicyear,
    admission_year:req.query.admissionyear,
    enquiry_no:req.query.enquiryno,
    student_name:req.query.enquiryname,
    grade:req.query.grade,
    proof_id:req.query.proofid,
    proof_name:req.query.proofname
  };
  console.log('-----------Insert Proof-------------');
  console.log(queryy); 
  
  connection.query(queryy,[response],function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': 'Inserted!'});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
 
});

app.post('/deleteproof',  urlencodedParser,function (req, res){
  
  console.log('In delete');
  connection.query("DELETE FROM mp_student_proof WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.enquiryno+"'",function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': 'Deleted!'});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
 
});

app.post('/fetchsecondlanguage',  urlencodedParser,function (req, res){
  
  console.log('In second lang');
  connection.query("SELECT * FROM language_master where language_type='II'",function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
 
});

app.post('/fetchthirdlanguage',  urlencodedParser,function (req, res){
  
  console.log('In third lang');
  connection.query("SELECT * FROM language_master where language_type='III'",function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
 
});

app.post('/fetchsearchadmissioninfo',  urlencodedParser,function (req, res){
  
  console.log('In info');
  connection.query("SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.enquiryno+"'",function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
 
});


app.post('/updateadmissionchecklist-service',  urlencodedParser,function (req, res){
  
  console.log('In update admission');
  var response={
    enquiry_no:req.query.enquiryno,
    school_id:req.query.schoolid,
    academic_year:req.query.academicyear,
    student_name:req.query.enquiryname,
    class_for_admission:req.query.grade,
    allergy_detail:req.query.alergy
  };
  var qur1="SELECT * FROM md_student WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.enquiryno+"'";
  var qur2="UPDATE md_student SET second_language='"+req.query.seclanguage+"',third_language='"+req.query.thirdlanguage+"' WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.enquiryno+"'";
  var qur3="SELECT * FROM md_disability_student_details WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.enquiryno+"'";
  var qur4="INSERT INTO md_disability_student_details SET ?";
  var qur5="UPDATE md_disability_student_details allergy_detail='"+req.query.alergy+"' WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.enquiryno+"'";
  console.log('---------------------');
  console.log(qur2);
  console.log(qur3);
  console.log(qur4);
  console.log(qur5);
  connection.query(qur1,function(err, rows){
      if(!err){ 
      connection.query(qur2,function(err, rows){
      connection.query(qur3,function(err, rows){
        console.log('length'+rows.length);
        if(rows.length==0){
          connection.query(qur4,[response],function(err, rows){
            res.status(200).json({'returnval': 'Updated!'});
          });
        }
        else{
          connection.query(qur5,function(err, rows){
            res.status(200).json({'returnval': 'Updated!'});
          });
        }
      });
      });
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
 
});

app.post('/fetchastudentadminsearch-service',  urlencodedParser,function (req, res){
  var qur="SELECT distinct(admission_no),student_name,discount_type FROM md_admission where school_id='"+req.query.schoolid+"' ";
  //console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
      } 
      else 
      {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
      }
    } 
    else 
    {
        console.log(err);
    }
    });
});




app.post('/fetchstudentdeldiscount-service',  urlencodedParser,function (req, res){
  // console.log('fetchstudinstallmentsplitup');
  /*var qur="SELECT * FROM md_admission WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"'";*/

  var qur="SELECT admission_no,student_name,class_for_admission,(select discount_type_name from md_discounts where id=referral_type) as discounttypename,referral_type FROM md_admission where admission_no='"+req.query.admissionno+"'";


  console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
      if(!err)
      {
        if(rows.length>0)
        {
          // console.log(JSON.stringify(rows));
          res.status(200).json({'returnval': rows});
        } 
        else 
        {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } 
      else 
      {
        console.log(err);
      }
    });
});

app.post('/deltediscount-service',  urlencodedParser,function (req, res){
  var qur="UPDATE md_admission SET referral_type='' WHERE admission_no='"+req.query.admissionno+"'";

  /*var qur="DELETE md_admission  WHERE admission_no='"+req.query.admissionno+"'";*/
  connection.query(qur,
    function(err, result)
    {
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Done!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to process!!'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/fetchuserrole-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_role";

  /*var qur="DELETE md_admission  WHERE admission_no='"+req.query.admissionno+"'";*/
  connection.query(qur,
    function(err, rows)
    {
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/usercreation-service',  urlencodedParser,function (req, res){
 
 var qur="INSERT INTO md_employee SET ?";
  
 var response={
  school_id:req.query.schoolid,
  employee_id:req.query.empid,
  employee_name:req.query.empname,
  password:'Password',
  role_id:req.query.roleid
 };

 connection.query(qur,[response],
    function(err, result)
    {
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Created!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Created!'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/fetchmenu-service',  urlencodedParser,function (req, res){
 
 var qur="SELECT * FROM md_menu";
 var qur1="SELECT * FROM md_menu_to_submenu ms join md_submenu sm on(ms.submenu_id=sm.submenu_id)";
 console.log(qur);
 console.log(qur1);
 var menu=[];
 var submenu=[];
 connection.query(qur,function(err, rows){
      if(!err){
        menu=rows;
        if(rows.length>0){
          connection.query(qur1,function(err, rows){
          submenu=rows;
          res.status(200).json({'menu': menu,'submenu':submenu});
          });
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/fetchsubmenu-service',  urlencodedParser,function (req, res){
 
 var qur="SELECT * FROM md_menu_to_submenu ms join md_submenu sm on(ms.submenu_id=sm.submenu_id) WHERE ms.menu_id='"+req.query.menuid+"'";
 connection.query(qur,
    function(err, rows)
    {
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/insertsubmenu-service',  urlencodedParser,function (req, res){
 
 var check="SELECT * FROM md_role_to_menu_submenu_mapping WHERE school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and menu_id='"+req.query.menuid+"' and status='true'";
 console.log('------------------------');
 console.log(check);

 connection.query(check,function(err, rows)
    {
      if(!err){
        if(rows.length>0){
          connection.query("UPDATE md_role_to_menu_submenu_mapping SET status='true' WHERE school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and menu_id='"+req.query.subid+"'",function(err, result){
            {
              if(result.affectedRows>0){
              res.status(200).json({'returnval': 'Added!'});
              }
            }            
          });
        } 
        else {
          connection.query("UPDATE md_role_to_menu_submenu_mapping SET status='true' WHERE school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and menu_id='"+req.query.menuid+"'",function(err, result){
            {
            if(result.affectedRows>0){
            connection.query("UPDATE md_role_to_menu_submenu_mapping SET status='true' WHERE school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and menu_id='"+req.query.subid+"'",function(err, result){
            {
              if(result.affectedRows>0){
              res.status(200).json({'returnval': 'Added!'});
              }
            }            
            });
            }
            }            
          });
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/deletesubmenu-service',  urlencodedParser,function (req, res){
 
 var check="SELECT * FROM md_role_to_menu_submenu_mapping WHERE school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and root_menu_id='"+req.query.menuid+"' and status='true'";
 
 connection.query(check,function(err, rows)
    {
      if(!err){
        if(rows.length>0){
          var length=rows.length;
          connection.query("UPDATE md_role_to_menu_submenu_mapping SET status='false' WHERE school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and menu_id='"+req.query.subid+"'",function(err, result){
            {
              console.log(result.affectedRows+"  "+length);
              if(result.affectedRows>0&&length==2){ 
              connection.query("UPDATE md_role_to_menu_submenu_mapping SET status='false' WHERE school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and menu_id='"+req.query.menuid+"'",function(err, result){               
              res.status(200).json({'returnval': 'Removed!'});
              });
              }
              else{
              res.status(200).json({'returnval': 'Removed!'});
              }
            }            
          });
        }
        else{
          connection.query("UPDATE md_role_to_menu_submenu_mapping SET status='false' WHERE school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and menu_id='"+req.query.menuid+"'",function(err, result){               
            res.status(200).json({'returnval': 'Removed!'});
          });     
        } 

      } else {
        console.log(err);
      }
    });
});


function setvalue(){
  console.log("calling setvalue.....");
}
var server = app.listen(8086, function () {
var host = server.address().address;
var port = server.address().port;
console.log("Example app listening at http://%s:%s", host, port);
});
