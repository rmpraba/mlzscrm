 var express    = require("express");
 var mysql      = require('mysql');
 var email   = require("emailjs/email");
 var connection = mysql.createConnection({  
  // host:"smis.cpldg3whrhyv.ap-south-1.rds.amazonaws.com",
  // database:"mlzscrm",
  // port:'3306',
  // user:"smis",
  // password:"smispass",
  // reconnect:true,
  // data_source_provider:"rds",
  // type:"mysql"
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : 'admin',
  database : 'crmtest'
  // host:"smiscopy.cpldg3whrhyv.ap-south-1.rds.amazonaws.com",
  // database:"mlzscrm",
  // port:'3306',
  // user:"smis",
  // password:"smiscopypass",
  // reconnect:true,
  // data_source_provider:"rds",
  // type:"mysql"
 }); 
var bodyParser = require('body-parser');
var app = express();

app.use(express.static('app'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
   res.sendFile("app/index.html" );
});

app.post('/smiscrm-logincheck',  urlencodedParser,function (req, res){
  var checkqur="SELECT * FROM md_register WHERE id='"+req.body.emp_id+"' AND password='"+req.body.emp_pass+"' AND school_id='"+req.body.school_id+"'";
  var checkqur1="SELECT * FROM md_register WHERE id='"+req.body.emp_id+"' AND password='"+req.body.emp_pass+"' AND device_id!='"+req.body.reg_id+"' AND school_id='"+req.body.school_id+"'";
  var updatequr="UPDATE md_register SET device_id='"+req.body.reg_id+"' WHERE id='"+req.body.emp_id+"' AND password='"+req.body.emp_pass+"' AND school_id='"+req.body.school_id+"'";
  var deletequr="DELETE FROM md_register WHERE WHERE id='"+req.body.emp_id+"' AND password='"+req.body.emp_pass+"' AND school_id='"+req.body.school_id+"'";
  connection.query(checkqur,function(err, rows){
    if(!err){
      if(rows.length>0){
       connection.query(updatequr,function(err, result){
          if(result.affectedRows>0){
            res.status(200).json({'returnval': 'Updated'});
          }
          else
          {
            connection.query(deletequr,function(err, result){
              if(result.affectedRows>0){
                res.status(200).json({'returnval': 'Deleted'});
              }
            });
          }
        });
      }
    }
  });

});

app.post('/smiscrm-login',  urlencodedParser,function (req, res){

  var qur="SELECT * FROM md_employee WHERE employee_id='"+req.body.emp_id+"' AND password='"+req.body.emp_pass+"'";
  var insertqur="INSERT INTO md_register SET ?";
  var school_id="";
  var role="";
  var emp_name="";
  var param={
    school_id:'',
    id:req.body.emp_id,
    password:req.body.emp_pass,
    device_id:req.body.reg_id,
    role:''
  };

  connection.query(qur,function(err, rows){
    if(!err){
      if(rows.length>0){
        school_id=rows[0].school_id;
        role=rows[0].role_id;
        emp_name=rows[0].employee_name;
        param.school_id=rows[0].school_id;
        param.role=rows[0].role_id;
      connection.query("SELECT * FROM md_register WHERE id='"+req.body.emp_id+"' AND password='"+req.body.emp_pass+"' AND school_id='"+school_id+"' ",function(err, rows){        
      if(!err){
       if(rows.length==0){
        connection.query(insertqur,[param],function(err, rows){
        if(!err)
        res.status(200).json({'returnval': 'Success','schoolid':school_id,'empname':emp_name,'emprole':role});
        else
        res.status(200).json({'returnval': err});
        });
      }
      else{
        connection.query("UPDATE md_register SET device_id='"+req.body.reg_id+"' WHERE id='"+req.body.emp_id+"' AND password='"+req.body.emp_pass+"' AND school_id='"+school_id+"'",function(err, rows){        
        if(!err)
        res.status(200).json({'returnval': 'Exist','schoolid':school_id,'empname':emp_name,'emprole':role});
        else
        res.status(200).json({'returnval': err});
        });
      }
      }
      else
        res.status(200).json({'returnval': 'invalid'});
      });
      } 
      else {
        res.status(200).json({'returnval': 'invalid'});
      }
    }
    else{
      console.log('hi');
      console.log(err);
      console.log('hi2');
    }
  });
});

app.post('/smiscrm-getfollowupcount',  urlencodedParser,function (req, res){

    //console.log('qur');
    var arr=[];
    connection.query("SELECT p.schedule_status, f.class, COUNT( * ) AS total FROM   student_enquiry_details AS f join followup as p WHERE f.school_id =  '"+req.body.schoolid+"' and f.academic_year =  '"+req.body.academicyear+"' and p.school_id =  '"+req.body.schoolid+"' AND p.schedule_status=  '"+req.body.status+"' AND f.enquiry_no = p.enquiry_id and f.status='Enquired' GROUP BY class ORDER BY (class)",
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      //console.log(rows);
      res.status(200).json(rows);
    }
    else
    {
      console.log(err);
      res.status(200).json(arr);
    }
  }
  else{
     console.log(err);
  }
});
});

app.post('/smiscrm-getfollowupstudents',  urlencodedParser,function (req, res)
 {
   var school={"school_id":req.body.schoolid};
   var academicyear={"school_id":req.body.academicyear};
   var grade={"class":req.body.grade};
   var status={"status":req.body.status};

   var checkstatus=req.body.status;
   if((checkstatus=='Closed')||(checkstatus=='Exhausted')){
        var qur = "SELECT f.enquiry_id,f.schedule_flag,s.enquiry_name,f.schedule_status,f.id,f.current_confidence_level,f.upcoming_date FROM followup f join student_enquiry_details s on f.enquiry_id=s.enquiry_no WHERE f.schedule_status='"+req.body.status+"' and s.class='"+req.body.grade+"' and s.academic_year='"+req.body.academicyear+"' and s.school_id = '"+req.body.schoolid+"' and f.followed_by='"+req.body.user+"' and s.status='Enquired' ORDER BY STR_TO_DATE(upcoming_date,'%d-%m-%Y') DESC";
   }
   else{
        var qur = "SELECT f.enquiry_id,f.schedule_flag,s.enquiry_name,f.schedule_status,f.id,f.current_confidence_level,f.upcoming_date FROM followup f join student_enquiry_details s on f.enquiry_id=s.enquiry_no WHERE f.schedule_status='"+req.body.status+"' and s.class='"+req.body.grade+"' and s.academic_year='"+req.body.academicyear+"' and s.school_id = '"+req.body.schoolid+"' and f.followed_by='"+req.body.user+"' and s.status='Enquired'  ORDER BY STR_TO_DATE(upcoming_date,'%d-%m-%Y')";
   }
   console.log(qur);
   var arr=[];
   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         //console.log(rows);
         res.status(200).json(rows);
       }
       else
       {
         console.log(err);
         res.status(200).json(arr);
       }

     });
 });

app.post('/smiscrm-currentdate-getfollowupstudents',  urlencodedParser,function (req, res)
 {
   var school={"school_id":req.body.schoolid};
   var academicyear={"school_id":req.body.academicyear};
   var grade={"class":req.body.grade};
   var status={"status":req.body.status};

   var checkstatus=req.body.status;
   var d=new Date();
   var currdate=d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();
   // var currdate='10-1-2018';
   // if((checkstatus=='Closed')||(checkstatus=='Exhausted')){
   //      var qur = "SELECT f.enquiry_id,f.schedule_flag,s.enquiry_name,f.schedule_status,f.id,f.current_confidence_level,f.upcoming_date FROM followup f join student_enquiry_details s on f.enquiry_id=s.enquiry_no WHERE f.schedule_status='"+req.body.status+"' and s.class='"+req.body.grade+"' and s.academic_year='"+req.body.academicyear+"' and s.school_id = '"+req.body.schoolid+"' and f.followed_by='"+req.body.user+"' and s.status='Enquired' ORDER BY STR_TO_DATE(upcoming_date,'%d-%m-%Y') DESC";
   // }
   // else{
   var qur = "SELECT f.enquiry_id,f.schedule_flag,s.enquiry_name,f.schedule_status,f.id,f.current_confidence_level,f.upcoming_date FROM followup f join student_enquiry_details s on f.enquiry_id=s.enquiry_no WHERE s.academic_year='"+req.body.academicyear+"' and s.school_id = '"+req.body.schoolid+"' and f.followed_by='"+req.body.user+"' and s.status='Enquired' and  STR_TO_DATE(upcoming_date,'%d-%m-%Y')=STR_TO_DATE('"+currdate+"','%d-%m-%Y') ORDER BY STR_TO_DATE(upcoming_date,'%d-%m-%Y')";
   // }
   console.log(qur);
   var arr=[];
   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         //console.log(rows);
         res.status(200).json(rows);
       }
       else
       {
         console.log(err);
         res.status(200).json(arr);
       }

     });
 });

app.post('/smiscrm-message-send',  urlencodedParser,function (req, res){
var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
        to: req.body.senttoid, 
        // collapse_key: 'your_collapse_key',        
        notification: {
            title: req.body.title, 
            body: req.body.empname+":"+req.body.issue 
        },        
        data: {  //you can send only notification or only data(or include both) 
            name: req.body.empname
        }
    };    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
            res.status(200).json({'returnval': 'sent'+response+" "+response.statusCode+"  "+response.statusMessage});
        } else {
            console.log("Successfully sent with response: ", response);
            res.status(200).json({'returnval': err+"  "+response+" "+response.statusCode+"  "+response.statusMessage});
        }
    });
});

app.post('/smiscrm-viewdetail',  urlencodedParser,function (req, res)
 {
   var school={"school_id":req.body.schoolid};
   var id={"enquiry_no":req.body.enquiryno};
   var qur = "select f.enquiry_id,f.current_confidence_level,f.id,f.schedule_no,f.last_schedule_date,f.schedule_Status,d.enquiry_no,d.enquiry_name,d.class,d.created_on,d.father_name,d.father_mob,d.guardian_mobile,d.guardian_name from followup as f Join student_enquiry_details d on d.enquiry_no=f.enquiry_id where f.id='"+req.body.followupid+"' and f.enquiry_id='"+req.body.enquiryno+"' and f.school_id='"+req.body.schoolid+"' and f.schedule_status='"+req.body.status+"' and d.academic_year='"+req.body.academicyear+"'";
   var arr=[];
   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         res.status(200).json(rows);
       }
       else
       {
         console.log(err);
         res.status(200).json(arr);
       }
     });
 });

app.post('/smiscrm-getlistdetails',  urlencodedParser,function (req, res){
    var school={"school_id":req.body.schoolid};
    var flwpid={"schedule_id":req.body.followupid};
    var scheduleno={"schedule":req.body.schduleno};
    var qur="SELECT * FROM followupdetail WHERE school_id='"+req.body.schoolid+"' and schedule_id='"+req.body.followupid+"' and schedule='"+req.body.scheduleno+"' and followup_status!='Cancelled' ORDER BY(str_to_date(schedule_date,'%Y-%m-%d'))";
    var arr=[];
    connection.query(qur,function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
     // console.log(rows);
      res.status(200).json(rows);
    }
    else
    {
      console.log(err);
      res.status(200).json(arr);
    }
  }
  else{
     console.log(err);
  }
});
});

/*this function is used to update the followup details of the current followup*/
 app.post('/smiscrm-updatefollowupdetails',  urlencodedParser,function (req, res)
{
  var school={"school_id":req.body.schoolid};
  var scheduledon={"schedule_date":req.body.scheduleddate};
  var followupid={"schedule_id":req.body.followupid};
  var no={"followup_no":req.body.followupno};
  var schedule={"schedule":req.body.scheduleid};
  var collection={"actual_date":req.body.currdate,"schedule_date":req.body.currdate,"next_followup_date":req.body.nextdate,"followup_comments":req.body.comments,"followup_status":req.body.callstatus,"confidence_level":req.body.confidencelevel};
    connection.query('update followupdetail set ? where ? and ? and ? and ?',[collection,school,followupid,no,schedule],
    function(err, result)
    {
    if(!err)
    {
      console.log('updated');
      if(result.affectedRows>0)
      res.status(200).json({'returnval': 'Success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
});
});


app.post('/smiscrm-updatefollowupschedule-service',  urlencodedParser,function (req, res){
  var followupno=req.body.followupno;
  var nextdate=new Date(req.body.nextdate);
  var date=new Date(req.body.currdate);
  var qur2="update followupdetail set schedule_date=DATE_FORMAT(DATE_ADD(STR_TO_DATE('"+req.body.nextdate+"','%d-%m-%Y'),INTERVAL start_interval DAY),'%d-%m-%Y'), "+
  " next_followup_date=DATE_FORMAT(DATE_ADD(STR_TO_DATE('"+req.body.nextdate+"','%d-%m-%Y'),INTERVAL end_interval DAY),'%d-%m-%Y') where followup_status='F' and "+
  " enquiry_id='"+req.body.enquiryid+"' AND school_id='"+req.body.schoolid+"' AND schedule_id='"+req.body.followupid+"' AND schedule='"+req.body.scheduleid+"'";
  console.log('-------------------followup sch update----------------');
  console.log(qur2);
         connection.query(qur2,function(err, result)
         {
          //console.log(rows);
          if(!err){
          if(result.affectedRows>0){            
           res.status(200).json({'returnval': 'Success'});
          }
          }
          else{
            console.log(err);
            res.status(200).json({'returnval':err});
          }
         });
});

 /*this function is used to update the followup of the current followup*/
 app.post('/smiscrm-updatefollowupconfidencelvl',  urlencodedParser,function (req, res)
{

  var school={"school_id":req.body.schoolid};
  var followupid={"id":req.body.followupid};
  var scheduleno={"schedule_no":req.body.scheduleid};
  var qur="SELECT * FROM followupdetail WHERE school_id='"+req.body.schoolid+"' AND schedule_id='"+req.body.followupid+"' AND enquiry_id='"+req.body.enquiryid+"' AND schedule='"+req.body.scheduleid+"' order by followup_no desc";
  console.log('-----------------confidencelevel update---------------------');
  console.log(qur);
  connection.query("SELECT * FROM followupdetail WHERE school_id='"+req.body.schoolid+"' AND schedule_id='"+req.body.followupid+"' AND enquiry_id='"+req.body.enquiryid+"' AND schedule='"+req.body.scheduleid+"' order by followup_no desc",function(err, rows)
    {
    if(!err){ 
    if(rows.length>0){ 
    var lastdate=rows[0].schedule_date;

    var confidence={"last_schedule_date":lastdate,"current_confidence_level":req.body.confidencelevel,"schedule_status":'Inprogress',"schedule_flag":req.body.followupno,"upcoming_date":req.body.nextdate};
    // res.status(200).json({'returnval': lastdate+"......"+confidence+"..."+school+"..."+followupid+"..."+scheduleno});
    connection.query('update followup set ? where ? and ? and ?',[confidence,school,followupid,scheduleno],
    function(err, result)
    {
    if(!err)
    {
      // console.log('updated1');
      if(result.affectedRows>0)
          res.status(200).json({'returnval': 'Success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': err});
    }

    });
  }
  else
    res.status(200).json({'returnval': 'no rows'+qur});
}
else
    {
      console.log(err);
      res.status(200).json({'returnval': 'Out......'+err});
    }
});
});

app.post('/smiscrm-collectiondashboard-service',  urlencodedParser,function (req, res){

   var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount from "+
   "md_student_paidfee where academic_year='"+req.body.academicyear+"' and school_id='"+req.body.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.body.academicyear+"' "+
    " and pf.academic_year='"+req.body.academicyear+"' and pf.school_id='"+req.body.schoolid+"' "+
    " and m.school_id='"+req.body.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   var discountqur="SELECT admission_no,sum(discount_amount) as discount_amount FROM md_student_discount WHERE school_id='"+req.body.schoolid+"' and academic_year='"+req.body.academicyear+"' group by admission_no";
   var d=new Date();
   var date=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
   var dayqur = "SELECT pdc_flag,sum(installment_amount)+sum(fine_amount) as amount FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and (STR_TO_DATE(paid_date,'%m/%d/%Y')=STR_TO_DATE('"+date+"','%m/%d/%Y')) "+
             "and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.body.schoolid+"' group by pdc_flag";          
   var fromdate=(d.getMonth()+1)+"/"+"1"+"/"+d.getFullYear();
   var todate=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
   var monthqur = "SELECT pdc_flag,sum(installment_amount)+sum(fine_amount) as amount FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+todate+"','%m/%d/%Y')) "+
             ") and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.body.schoolid+"' group by pdc_flag";          
 
 console.log('-----------------------pending fee report--------------------------');
 console.log(totalqur);
 console.log('-------------------------------------------------');
  console.log(paidqur);
 console.log('-------------------------------------------------');
  console.log(dayqur);
 console.log('-------------------------------------------------');
 console.log(monthqur);
 var totalarr=[];
 var paidarr=[];
 var pendingarr=[];
 var regfee=[];
 var discount=[];
   connection.query(totalqur,function(err, rows){
       if(!err){         
          totalarr=rows;
          connection.query(paidqur,function(err, rows){
          if(!err){
          paidarr=rows;
          connection.query(discountqur,function(err, rows){
          if(!err){
            discount=rows;
        if(totalarr.length>0){
        var pflag=0;
        var npflag=0;
        for(var i=0;i<totalarr.length;i++)
        {
          totalarr[i].sno=(i+1);
          var paidamount=0;
          var paidflag=0;
          var pendingamount=0;
          var pendingflag=0;
          var discountamount=0;
          if(paidarr.length>0){
          for(var j=0;j<paidarr.length;j++){
            if(totalarr[i].admission_no==paidarr[j].admission_no)
            {
              paidflag=1;
              paidamount=parseFloat(paidamount)+(parseFloat(paidarr[j].paidamount)-parseFloat(0));
              totalarr[i].paid_amount=paidamount;
              pflag++;
            }
          }
          if(paidflag==0)
            {
            paidamount=parseFloat(paidamount)+parseFloat(0);
            totalarr[i].paid_amount=paidamount;
            // totalarr[i].discount_amount=0;
            npflag++;
            }
          paidamount=0;
          paidflag=0;
          discountamount=0;
          }
        }
        }

        if(discount.length>0){
        for(var i=0;i<totalarr.length;i++){
          var f=0;
          for(var j=0;j<discount.length;j++){
            if(totalarr[i].admission_no==discount[j].admission_no){
              f=1;
              totalarr[i].discount_amount=discount[j].discount_amount;
            }
          }
          if(f==0)
            totalarr[i].discount_amount=0;
        }
        }
        for(var i=0;i<totalarr.length;i++){          
          totalarr[i].total_amount=parseFloat(totalarr[i].fees)-parseFloat(totalarr[i].discount_amount);
          totalarr[i].pending_amount=parseFloat(totalarr[i].total_amount)-parseFloat(totalarr[i].paid_amount);
        }
        var actual=0,discount=0,total=0,paid=0,pending=0;
        for(var i=0;i<totalarr.length;i++){
          actual=parseFloat(totalarr[i].fees)+parseFloat(actual);
          discount=parseFloat(totalarr[i].discount_amount)+parseFloat(discount);
          total=parseFloat(totalarr[i].total_amount)+parseFloat(total);
          paid=parseFloat(totalarr[i].paid_amount)+parseFloat(paid);
          pending=parseFloat(totalarr[i].pending_amount)+parseFloat(pending);
        }
      var dayarr=[];
       var montharr=[];
       var daycoll=0,daypdc=0,monthcoll=0,monthpdc=0;
       connection.query(dayqur,function(err, rows){
       if(!err){ 
        dayarr=rows;
       connection.query(monthqur,function(err, rows){
       if(!err){ 
        montharr=rows;
        if(dayarr.length>0){
          for(var i=0;i<dayarr.length;i++){
            if(dayarr[i].pdc_flag=="1")
              daycoll=dayarr[i].amount;
            if(dayarr[i].pdc_flag=="2")
              daypdc=dayarr[i].amount;
          }
        }
        if(montharr.length>0){
          for(var i=0;i<montharr.length;i++){
            if(montharr[i].pdc_flag=="1")
              monthcoll=montharr[i].amount;
            if(montharr[i].pdc_flag=="2")
              monthpdc=montharr[i].amount;
          }
        }
        var display=[];
        display.push({'dc':daycoll,'dp':daypdc,'mc':monthcoll,'mp':monthpdc,'actual':actual,'discount':discount,'total':total,'paid':paid,'pending':pending});

        res.status(200).json(display);
       }
       });
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

app.post('/smiscrm-enrollmentdashboard-service',  urlencodedParser,function (req, res){
  
  var arr=[];
  var totalqur="SELECT status,count(enquiry_no) as total FROM student_enquiry_details WHERE school_id='"+req.body.schoolid+"' and academic_year='"+req.body.academicyear+"' group by status";
  var d=new Date();
  var fromdate=(d.getMonth()+1)+"/"+"1"+"/"+d.getFullYear();
  var todate=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
  var dayqur="SELECT status,count(enquiry_no) as total FROM student_enquiry_details WHERE school_id='"+req.body.schoolid+"' and academic_year='"+req.body.academicyear+"' and (STR_TO_DATE(enquired_date,'%m/%d/%Y')=STR_TO_DATE('"+todate+"','%m/%d/%Y')) group by status";
  var monthqur="SELECT status,count(enquiry_no) as total FROM student_enquiry_details WHERE school_id='"+req.body.schoolid+"' and academic_year='"+req.body.academicyear+"' and (STR_TO_DATE(enquired_date,'%m/%d/%Y')>=STR_TO_DATE('"+fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(enquired_date,'%m/%d/%Y')<=STR_TO_DATE('"+todate+"','%m/%d/%Y')) group by status";
  var totalarr=[];
  var day=[];
  var month=[];
  console.log(totalqur);
  console.log('---------------------------------------');
  console.log(dayqur);
  console.log('---------------------------------------');
  console.log(monthqur);
  console.log('---------------------------------------');
        connection.query(totalqur,function(err, rows){
          if(!err){
          if(rows.length>0){ 
            totalarr=rows;
          connection.query(dayqur,function(err, rows){
          if(!err){ 
            day=rows;
          connection.query(monthqur,function(err, rows){
          if(!err){  
            month=rows;
            var dayenq=0,monthenq=0,totalenq=0;
            var dayadmn=0,monthadmn=0,totaladmn=0;  
            var daywith=0,monthwith=0,totalwith=0;   
            if(totalarr.length>0){
              for(var i=0;i<totalarr.length;i++){
                totalenq=parseInt(totalarr[i].total)+parseInt(totalenq);
                if(totalarr[i].status=="Admitted"){
                  totaladmn=parseInt(totalarr[i].total)+parseInt(totaladmn);
                }
                if(totalarr[i].status=="Withdrawn"){
                  totalwith=parseInt(totalarr[i].total)+parseInt(totalwith);
                }
              }
            }
            if(day.length>0){
              for(var i=0;i<day.length;i++){
                dayenq=parseInt(day[i].total)+parseInt(dayenq);
                if(day[i].status=="Admitted"){
                  dayadmn=parseInt(day[i].total)+parseInt(dayadmn);
                }
                if(day[i].status=="Withdrawn"){
                  daywith=parseInt(day[i].total)+parseInt(daywith);
                }
              }
            }
            if(month.length>0){
              for(var i=0;i<month.length;i++){
                monthenq=parseInt(month[i].total)+parseInt(monthenq);
                if(month[i].status=="Admitted"){
                  monthadmn=parseInt(month[i].total)+parseInt(monthadmn);
                }
                if(month[i].status=="Withdrawn"){
                  monthwith=parseInt(month[i].total)+parseInt(monthwith);
                }
              }
            }
            var display=[];
            display.push({"todayenq":dayenq,"monthenq":monthenq,"totalenq":totalenq,"todayadmn":dayadmn,"monthadmn":monthadmn,"totaladmn":totaladmn,"todaywith":daywith,"monthwith":monthwith,"totalwith":totalwith});
           res.status(200).json(display);
          }
          else
            console.log(err);
          });
          }
          else
            console.log(err);
          });
          }
          else{
            console.log(err);
          }
          }
          else{
            console.log(err);
            res.status(200).json(arr);
          }
         });
});

app.post('/loginpage',  urlencodedParser,function (req, res)
{
  var user={"employee_id":req.query.username};
  var pass={"password":req.query.password};
  //console.log('hi');
  var loginarr=[];
  var rolearr=[];
  connection.query('SELECT (select society_name from md_school where id=e.school_id) as societyname,(select short_name from md_school where id=e.school_id) as shortname,(select address from md_school where id=e.school_id) as address,(select name from md_school where id=e.school_id) as schoolname,e.school_id,e.employee_id, e.employee_name,e.role_id, r.role_name FROM md_employee as e JOIN md_role as r  on r.role_id=e.role_id  where ? and ?',[user,pass],
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
      // feetype_installment:req.query.feetypeinstallment,
      created_by:req.query.createdby,
      common_feetype:req.query.commonfeetype
    };
    var splitcheck="SELECT * FROM fee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type='"+req.query.feetype+"'";
    var feemastercheck="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"'";

    connection.query(splitcheck,function(err, rows){
    if(rows.length==0){
    connection.query('INSERT INTO fee_splitup SET ?',[splitup],function(err, rows){
      if(!err){
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
    }
    else
      console.log(err);
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


app.post('/checkapplicationfeepaidstatus-service',  urlencodedParser,function (req, res){
    var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and (enquiry_no = '"+req.query.enquiryno+"' or admission_no='"+req.query.enquiryno+"') and installment='Application Fee' ";
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
    var fetchqur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and (admission_no='"+req.query.admissionno+"' or enquiry_no='"+req.query.admissionno+"') ";
    console.log('-----------fetch academicyear for already paid scenario-----------');
    console.log(fetchqur);
    console.log('------------------------------------------------------------------');
    connection.query(fetchqur,function(err, rows){
    if(!err){
    if(rows.length>0){      
    var academicyear=rows[0].academic_year;
    var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+academicyear+"' and (admission_no = '"+req.query.admissionno+"' or enquiry_no='"+req.query.admissionno+"') and installment not in ('Registration fee','Application fee','Caution deposit') and cheque_status not in ('cancelled','bounced')";
    console.log('-----------query after academicyear-----------');
    console.log(qur);
    console.log('------------------------------------------------------------------');
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows,'academicyear':academicyear});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'no rows','academicyear':academicyear});
    }
  }
  else{
     console.log(err);
  }
});
  }
}
else
 console.log(err);
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
        // transport_availed:req.query.admissiontransport,
        transport_availed:'Yes',
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
              res.status(200).json({'returnval': response.admission_no,'enquiryno':response.enquiry_no});
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


app.post('/collection-updateapplnfeeadmissionno-service',  urlencodedParser,function (req, res){
    var qur="UPDATE md_student_paidfee set admission_no='"+req.query.admissionno+"' WHERE admission_no='"+req.query.enquiryno+"' and school_id='"+req.query.schoolid+"' and installment='Application Fee'";
    console.log(qur);
    connection.query(qur,
    function(err, result)
    {
    if(!err)
    {
    if(result.affectedRows>0)
    {
      res.status(200).json({'returnval': "Updated"});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'Not updated'});
    }
  }
  else{
     console.log(err);
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
          if(rows[i].fee_type=='Registration fee'||rows[i].fee_type=='Caution deposit')
            regfee=parseFloat(regfee)+parseFloat(rows[i].total_fee);
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
    " and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type not in ('Registration fee','Caution deposit') ";
    else
    qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' AND mode='"+req.query.mode+"' and type in('All','"+req.query.studenttype+"') AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' AND discount_type_code in ('"+req.query.discounttype+"','5','"+req.query.referraltype+"') "+
    " AND grade=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"') "+
    " and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type not in ('Registration fee','Caution deposit')";
    
    }
    else{
    console.log('out');
    if(req.query.referraltype==""||req.query.referraltype==null)
    qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' AND mode='"+req.query.mode+"' and type in('All','"+req.query.studenttype+"') AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' AND discount_type_code='"+req.query.discounttype+"' "+
    " AND grade=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"') "+
    " and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type not in ('Registration fee','Caution deposit','Lumpsum')";
    else
    qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' AND mode='"+req.query.mode+"' and type in('All','"+req.query.studenttype+"') AND academic_year='"+req.query.academicyear+"' AND admission_year='"+req.query.admissionyear+"' AND discount_type_code in ('"+req.query.discounttype+"','"+req.query.referraltype+"')  "+
    " AND grade=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"') "+
    " and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type not in ('Registration fee','Caution deposit','Lumpsum')";
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
    var qur="SELECT * FROM md_fee_splitup_master WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type not in ('Registration fee','Caution deposit') order by base_fee_type";
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

    var qur="SELECT * FROM fee_splitup WHERE fee_code='"+req.query.feecode+"' and school_id='"+req.query.schoolid+"' and fee_type='"+req.query.feetype+"'";
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

    var qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' and admission_year = '"+req.query.admissionyear+"' and academic_year='"+req.query.academicyear+"' and grade=(SELECT grade_id FROM grade_master WHERE grade_name='"+req.query.grade+"') and discount_type_code='"+req.query.discounttype+"' and from_date<='"+req.query.currdate+"' and to_date>='"+req.query.currdate+"' and fee_type='"+req.query.feetype+"'";
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
    
    var fetchqur1="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.admissionno+"' ";
    var fetchqur2="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and (admission_no='"+req.query.admissionno+"' or enquiry_no='"+req.query.admissionno+"') ";
    console.log('-------------Console for alreadypaid scenario----------------');
    console.log(fetchqur1);
    console.log(fetchqur2);
    connection.query(fetchqur1,function(err, rows){
    if(!err){
    if(rows.length>0){      
    var academicyear=rows[0].academic_year
    var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+academicyear+"' and (admission_no = '"+req.query.admissionno+"' or enquiry_no='"+req.query.admissionno+"') and installment='"+req.query.feetype+"'";
    console.log('----------console after fetching academicyear-------------');
    console.log(qur);
    console.log('----------------------------------------------------------');
    connection.query(qur,function(err, rows)
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
  }
  else{
    connection.query(fetchqur2,function(err, rows){
    if(!err){
    if(rows.length>0){  
    var academicyear=rows[0].academic_year
    var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+academicyear+"' and (admission_no = '"+req.query.admissionno+"' or enquiry_no='"+req.query.admissionno+"') and installment='"+req.query.feetype+"'";
    console.log('----------console after fetching academicyear-------------');
    console.log(qur);
    console.log('----------------------------------------------------------');
    connection.query(qur,function(err, rows)
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
    }
  }
});
  }
}
else
console.log(err);
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
    console.log('qur');
    connection.query('SELECT status,class,count(*) as total FROM `student_enquiry_details` WHERE ? and ? and ? group by (class)',[qur,state,acyear],
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

/*this function is to get the count of enquiry takes placed by grade wise*/
app.post('/getadmittedcount',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    var state={"status":req.query.status};
    var acyear={"academic_year":req.query.academicyear};
    console.log('----------------admitted count-----------------');
    console.log(qur);
    connection.query('SELECT *,class,count(*) as total FROM `student_enquiry_details` WHERE ? and ? and ? group by (class)',[qur,state,acyear],
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

/*this function is to get the count of admission cancellation takes placed by grade wise*/
app.post('/getcancelledcount',  urlencodedParser,function (req, res){
    var qur={"school_id":req.query.schol};
    var state={"active_status":req.query.status};
    var acyear={"academic_year":req.query.academicyear};
    //console.log('qur');
    console.log('----------------cancelled count-----------------');
    console.log(acyear);
    connection.query('SELECT *,class_for_admission as class,count(*) as total FROM `md_admission` WHERE ? and ? and ? group by (class_for_admission)',[qur,state,acyear],
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
  var collection={
    "school_id":req.query.schol,
    "id":'',
    "enquiry_id":req.query.enquiryno,
    "schedule_no":req.query.schedule,
    "created_by":req.query.createdby,
    "created_on":req.query.createdon,
    "current_confidence_level":req.query.currconfidence,
    "schedule_status":req.query.schedulestatus,
    "schedule_flag":req.query.scheduleflag,
    "no_of_days":req.query.noofdays,
    "no_of_schedules":req.query.noofschedule,
    "last_schedule_date":req.query.lastscheduleon,
    "upcoming_date":req.query.upcomingdate,
    "followed_by":req.query.followername
    };
    var followupno="";
    var newfollowupno="";
    connection.query("SELECT * FROM sequence WHERE school_id='"+req.query.schol+"'",function(err, rows){
    if(!err)
    {
    followupno="Followup#"+parseInt(rows[0].followup_no)+1;
    newfollowupno=parseInt(rows[0].followup_no)+1;
    collection.id=followupno;
    connection.query('insert into followup set ? ',[collection],function(err, rows)
    {
    if(!err)
    {
      connection.query("UPDATE sequence SET followup_no='"+newfollowupno+"' WHERE school_id='"+req.query.schol+"'",function(err, rows){
      if(!err)
      res.status(200).json({'returnval': 'success','followupno':collection.id});
      });
    }
    else
    {
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

/*this below function is used to insert data in the follow up detail table */
app.post('/updatefollowdetail',  urlencodedParser,function (req, res)
{
   var collection={
    "school_id":req.query.schol,
    "schedule_id":req.query.id,
    "enquiry_id":req.query.enquiryid,
    "followup_no":req.query.followupno,
    "schedule_date":req.query.followupdate,
    "next_followup_date":req.query.nextfolowup,
    "schedule":req.query.schedule,
    "followup_status":req.query.flag,
    "created_by":req.query.createdby,
    "created_on":req.query.createdon,
    "start_interval":req.query.startinterval,
    "end_interval":req.query.endinterval
   };
    connection.query('insert into followupdetail set ? ',[collection],function(err, rows)
    {
    if(!err)
    {
      //console.log('inserted');
      res.status(200).json({'returnval': 'success','ret':req.query.startinterval+req.query.endinterval});
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
    connection.query("SELECT p.schedule_status, f.class, COUNT( * ) AS total,f.academic_year FROM   student_enquiry_details AS f join followup as p WHERE f.academic_year='"+req.query.academicyear+"' and p.`school_id` =  '"+req.query.schol+"' AND p.schedule_status=  '"+req.query.status+"' AND f.enquiry_no = p.enquiry_id and f.status='Enquired' GROUP BY class ORDER BY (`class`)",
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
        var qur = "SELECT f.enquiry_id,f.schedule_flag,s.enquiry_name,f.schedule_status,f.id,f.current_confidence_level,f.upcoming_date FROM followup f join student_enquiry_details s on f.enquiry_id=s.enquiry_no WHERE s.academic_year='"+req.query.academicyear+"' and f.schedule_status='"+req.query.fnstatus+"' and s.class='"+req.query.fngrade+"' and s.school_id = '"+req.query.schol+"' and f.followed_by='"+req.query.user+"' and s.status='Enquired' ORDER BY (upcoming_date) DESC";
   }
   else{
        var qur = "SELECT f.enquiry_id,f.schedule_flag,s.enquiry_name,f.schedule_status,f.id,f.current_confidence_level,f.upcoming_date FROM followup f join student_enquiry_details s on f.enquiry_id=s.enquiry_no WHERE s.academic_year='"+req.query.academicyear+"' and f.schedule_status='"+req.query.fnstatus+"' and s.class='"+req.query.fngrade+"' and s.school_id = '"+req.query.schol+"' and f.followed_by='"+req.query.user+"' and s.status='Enquired'  ORDER BY (upcoming_date)";
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
   var qur="SELECT * FROM student_enquiry_details WHERE academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schol+"' and class='"+req.query.fngrade+"' and status='"+req.query.fnstatus+"'";
   console.log(qur);
   connection.query(qur,
     function(err, rows)
     {
       if(!err)
       {
         // console.log(rows);
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

app.post('/checkupcomingfollowup-service',  urlencodedParser,function (req, res)
{
  connection.query("select * from followup where school_id='"+req.query.schoolid+"' and id='"+req.query.followupid+"' and schedule_no='"+req.query.scheduleid+"' and schedule_flag='"+req.query.followupno+"'",
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
      res.status(200).json({'returnval': 'invalid'});
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
    var qur="SELECT * FROM followupdetail WHERE school_id='"+req.query.schol+"' and schedule_id='"+req.query.fid+"' and schedule='"+req.query.flag+"' and followup_status!='Cancelled' ORDER BY(str_to_date(schedule_date,'%d-%m-%Y'))";
   console.log(qur);

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
   var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared')";
   else
   var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
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
   var qur = "SELECT * FROM md_student_paidfee where paymenttype_flag!='2' and (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe','Third party') and admission_status='"+req.query.type+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque','third party') and admission_status='"+req.query.type+"' and cheque_status not in('bounced')) and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cancelled','withdrawn') and admission_status='"+req.query.type+"' ";          
   var qur1 = "SELECT * FROM md_student_paidfee WHERE paymenttype_flag!='2' and mode_of_payment='Cheque' AND STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') and school_id='SCH002' and cheque_status in('inprogress','withdrawn','cancelled') and cheque_status not in('bounced') and (cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and admission_status='"+req.query.type+"'";             
   var qur2 = "SELECT * FROM md_student_paidfee WHERE paymenttype_flag!='2' and mode_of_payment='Cheque' AND STR_TO_DATE(cheque_date,'%m/%d/%Y')<STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') AND STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') and school_id='SCH002' and cheque_status in('inprogress','withdrawn','cancelled') and cheque_status not in('bounced') and (cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and admission_status='"+req.query.type+"'";             
   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where paymenttype_flag!='2' and (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe','Third party') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque','third party') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"' and cheque_status not in('bounced')) and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cancelled','withdrawn') and admission_status='"+req.query.type+"'";
   var qur1 = "SELECT * FROM md_student_paidfee WHERE paymenttype_flag!='2' and mode_of_payment='Cheque' AND STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') and school_id='SCH002' and cheque_status in('inprogress','withdrawn','cancelled') and cheque_status not in('bounced') and (cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and admission_status='"+req.query.type+"'";             
   var qur2 = "SELECT * FROM md_student_paidfee WHERE paymenttype_flag!='2' and mode_of_payment='Cheque' AND STR_TO_DATE(cheque_date,'%m/%d/%Y')<STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') AND STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') and school_id='SCH002' and cheque_status in('inprogress','withdrawn','cancelled') and cheque_status not in('bounced') and (cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and admission_status='"+req.query.type+"'";             
   }
  }
  else{
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM md_student_paidfee where paymenttype_flag!='2' and (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe','Third party') ) or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque','third party') and cheque_status not in('bounced')) and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','withdrawn','cancelled') ";          
   var qur1 = "SELECT * FROM md_student_paidfee WHERE paymenttype_flag!='2' and mode_of_payment='Cheque' AND STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') and school_id='SCH002' and cheque_status in('inprogress','withdrawn','cancelled') and cheque_status not in('bounced') and (cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"'))";
   var qur2 = "SELECT * FROM md_student_paidfee WHERE paymenttype_flag!='2' and mode_of_payment='Cheque' AND STR_TO_DATE(cheque_date,'%m/%d/%Y')<STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') and school_id='SCH002' and cheque_status in('inprogress','withdrawn','cancelled') and cheque_status not in('bounced') and (cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"'))";             
   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where paymenttype_flag!='2' and (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe','Third party')  and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque','third party')  and grade='"+req.query.grade+"' and cheque_status not in('bounced')) and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cancelled','bounced') ";
   var qur1 = "SELECT * FROM md_student_paidfee WHERE paymenttype_flag!='2' and mode_of_payment='Cheque' AND STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') and school_id='SCH002' and cheque_status in('inprogress','withdrawn','cancelled') and cheque_status not in('bounced') and (cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"'))";             
   var qur2 = "SELECT * FROM md_student_paidfee WHERE paymenttype_flag!='2' and mode_of_payment='Cheque' AND STR_TO_DATE(cheque_date,'%m/%d/%Y')<STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') and school_id='SCH002' and cheque_status in('inprogress','withdrawn','cancelled') and cheque_status not in('bounced') and (cheque_date in (select installment_date from md_installment_date where school_id='"+req.query.schoolid+"'))";             
   }
  }
 console.log('-----------------------collection report--------------------------');
 console.log(qur);
 console.log(qur1);
 console.log(qur2);
 console.log('-------------------------------------------------');
 var todaycoll=[];
 var chequecoll=[];
   connection.query(qur,function(err, rows){
       if(!err){
        todaycoll=rows;
         connection.query(qur1,function(err, rows){
         if(!err){
         chequecoll=rows;
         connection.query(qur2,function(err, rows){
         if(!err){
         res.status(200).json({'todaycoll': todaycoll,'chequecoll':chequecoll,'returnval':rows});
         }
         });
         }
         else{
           console.log(err);
           res.status(200).json({'returnval':'no rows'});
         }
         });
         // if(rows.length>0){           
         // }
         // else{
         //   console.log(err);
         //   res.status(200).json({'returnval':'no rows'});
         // }
       }
       else{
         console.log(err);
       }
     });
 });

app.post('/detaildaycollection-service',  urlencodedParser,function (req, res){
  if(req.query.type!="All"){
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"') and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"' ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"'";
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
  }
  else{
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') ) or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') ) and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
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
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"') and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"' ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"') and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and admission_status='"+req.query.type+"'";
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
  }
  else{
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') ) or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') ) and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
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
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"') and admission_status='"+req.query.type+"') and school_id='"+req.query.schoolid+"' and paid_status in('inprogress') and admission_status='"+req.query.type+"' ";          
   var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
    var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"') and admission_status='"+req.query.type+"') and school_id='"+req.query.schoolid+"' and paid_status in('inprogress') and grade='"+req.query.grade+"' and admission_status='"+req.query.type+"' ";          
    var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
  }
  else{
   if(req.query.grade=="All Grades"){
    var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and school_id='"+req.query.schoolid+"' and paid_status in('inprogress') ";          
    var qur1= "SELECT * FROM md_studwise_fee_splitup WHERE school_id='"+req.query.schoolid+"'";
   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y'))) and mode_of_payment in('cheque') and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and school_id='"+req.query.schoolid+"' and paid_status in('inprogress') and grade='"+req.query.grade+"'";
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
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and mode_of_payment in('cash','Transfer','Card Swipe') and paymenttype_flag='2') or (((STR_TO_DATE(received_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')  and STR_TO_DATE(received_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_date not in(select installment_date from md_installment_date where school_id='"+req.query.schoolid+"')) and mode_of_payment in('cheque') and paymenttype_flag='2') and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') and paymenttype_flag='2'";          
   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where (((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
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
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by paid_date";
  else if(req.query.filtertype=="Cheque Collection")
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') "+
             " and mode_of_payment='Cheque' order by paid_date";
  else if(req.query.filtertype=="Cash Collection")
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') "+
             " and mode_of_payment='Cash' order by paid_date";
  else if(req.query.filtertype=="FeeTypewise Collection")
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by installment_type";
   else if(req.query.filtertype=="Overall Collection")
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by installment_type";
  }
  else{
  if(req.query.filtertype=="General")
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by paid_date";
  else if(req.query.filtertype=="Cheque Collection")
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') "+
             " and mode_of_payment='Cheque' order by paid_date";
  else if(req.query.filtertype=="Cash Collection")
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') "+
             " and mode_of_payment='Cash' order by paid_date";
  else if(req.query.filtertype=="FeeTypewise Collection")
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and grade='"+req.query.grade+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','inprogress','cleared') order by installment_type";
   else if(req.query.filtertype=="Overall Collection")
    var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
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
   var qur = "SELECT installment,sum(installment_amount) FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
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
  var schno={"schedule_no":req.query.scheduleno};
  var collection={"reschedule_by":req.query.user,"rescheduled_on":req.query.today,"schedule_status":"Exhausted"};
  connection.query('update followup set ? where ? and ?',[collection,school,followupid,schno],
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
   var qur = "SELECT * FROM followup where school_id='"+req.query.schol+"' and id='"+req.query.fid+"' and schedule_no='"+req.query.scheduleno+"'";
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
  if(req.query.type=="namesearch")
   var qur = "SELECT * FROM md_student_paidfee where admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and mode_of_payment='Cheque' and paid_status='inprogress' and cheque_status not in('bounced','cancelled') order by installment_date";
  else
   var qur = "SELECT * FROM md_student_paidfee where STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') "+
             "and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') and school_id='"+req.query.schoolid+"' and mode_of_payment='Cheque' and paid_status='inprogress' and cheque_status not in('bounced','cancelled') order by installment_date";
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
            connection.query("SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"'  and academic_year='"+req.query.academicyear+"'",function(err, rows){
              admninfo=rows;
            connection.query("UPDATE md_admission SET active_status='Withdrawn' WHERE school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"'  and academic_year='"+req.query.academicyear+"'",function(err, rows){
            if(!err){
            connection.query("UPDATE student_enquiry_details SET status='Withdrawn' WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+admninfo[0].enquiry_no+"'  and academic_year='"+req.query.academicyear+"'",function(err, result){
            connection.query("UPDATE md_student_paidfee SET paid_status='Withdrawn',cheque_status='Withdrawn' WHERE school_id='"+req.query.schoolid+"' and (admission_no='"+req.query.admissionno+"' or admission_no='"+admninfo[0].enquiry_no+"') and academic_year='"+req.query.academicyear+"'",function(err, result){
            if(!err){
            console.log('-----------------'+result.affectedRows);
            res.status(200).json({'returnval': 'Done!','info':response,'receiptno':response.ack_no,'admninfo':admninfo});
            }
            });
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
  " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' and paid_status='inprogress'";

  var chequeupdate="UPDATE tr_cheque_details SET paid_status='inprogress',cheque_status='"+req.query.chequestatus+"' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
  " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
  " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' and cheque_status='inprogress'";


  console.log('----------------------------------------------');
  console.log(masterupdate);
  console.log('----------------------------------------------');
  console.log(chequeupdate);
  var response={};
   if(req.query.chequestatus=="cleared"){
    connection.query("SELECT * FROM receipt_sequence",function(err, rows){
    response.receipt_no="REC-"+req.query.academicyear+"-"+rows[0].receipt_seq;    
    var new_receipt_no=parseInt(rows[0].receipt_seq)+1;
    var masterupdate="UPDATE md_student_paidfee SET realised_date='"+req.query.realiseddate+"',paid_status='"+req.query.paidstatus+"',cheque_status='"+req.query.chequestatus+"',receipt_no='"+response.receipt_no+"' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
    " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
    " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"'";

    var chequeupdate="UPDATE tr_cheque_details SET realised_date='"+req.query.realiseddate+"',paid_status='"+req.query.paidstatus+"',cheque_status='"+req.query.chequestatus+"',receipt_no='"+response.receipt_no+"' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
    " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
    " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' ";

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
    " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' ";

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
   else if(req.query.chequestatus=="cancelled"){
   var masterupdate="DELETE FROM md_student_paidfee WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
    " and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment='"+req.query.installment+"' and "+
    " cheque_no='"+req.query.chequeno+"' and bank_name='"+req.query.bankname+"' ";

   var chequeupdate="DELETE FROM tr_cheque_details WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+req.query.enquiryno+"') "+
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
    var scheduleno=req.query.scheduleno;
   var school={"school_id":req.query.schol};
   var collection={"reschedule_by":req.query.user,"rescheduled_on":req.query.today,"schedule_status":req.query.fnstatus};
   var followupid={"id":req.query.followupid};
   connection.query('update followup set ? where ? and ? and ?',[collection,school,followupid,scheduleno],
     function(err, rows)
     {
       if(!err)
       {
         console.log('inserted');
         // res.status(200).json({'returnval': 'success'});
         if(check=='Not Interested'||check=='Closed'){
            connection.query('update student_enquiry_details set status="Closed" where ? and ?',[school,enquiryid],
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
                 res.status(200).json({'returnval': 'Unable to update!'});
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

    var admnupdate={
      class_for_admission:req.query.grade,
      first_name:req.query.firstname,
      middle_name:req.query.middlename,
      last_name:req.query.lastname,
      gender:req.query.gender,
      dob:req.query.dobdate,
      father_name:req.query.fathername,
      mother_name:req.query.mothername,
      age:req.query.ageofyr,
      student_name:req.query.enquiryname
    };
    var studupdate={
      class_for_admission:req.query.grade,
      first_name:req.query.firstname,
      middle_name:req.query.middlename,
      last_name:req.query.lastname,
      gender:req.query.gender,
      dob:req.query.dobdate,
      father_name:req.query.fathername,
      mother_name:req.query.mothername,
      age:req.query.ageofyr,
      father_occupation:req.query.dadoccupationinfo,
      mother_occupation:req.query.motheroccupationinfo,
      father_mobile:req.query.mob,
      mother_mobile:req.query.mothermob,
      father_email:req.query.email,
      mother_email:req.query.motheremail,
      guard_mobile_no:req.query.guardianmobile,
      guardian_name:req.query.guardianname,
      student_name:req.query.enquiryname
    };

    var feeupdate={
      student_name:req.query.enquiryname,
      grade:req.query.grade
    }
    
    var selqur="SELECT admission_no FROM md_admission WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academicyear+"' and enquiry_no='"+req.query.enquiryno+"'";
    var updatequr="UPDATE md_student_paidfee SET ? WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academicyear+"' and (admission_no='"+admnno+"' or admission_no='"+req.query.enquiryno+"')";
    var enquiryno={enquiry_no:req.query.enquiryno};
    var schoolid={school_id:req.query.schol};
    var acyear={academic_year:req.query.academicyear};
    console.log('------------------------------------------');
    console.log(JSON.stringify(enquiryno)+"  "+JSON.stringify(schoolid)+"  "+JSON.stringify(acyear));
    console.log(selqur);
    console.log('------------------------------------------');
    console.log(updatequr);
    var admnno={};
    connection.query('UPDATE student_enquiry_details SET ? WHERE ? and ? and ?',[response,enquiryno,schoolid,acyear],function(err, rows){
      if(!err){
        connection.query(selqur,function(err, rows){
        if(rows.length==0)
          res.status(200).json({'returnval': 'Updated!!'});
        else{
          admnno.admissionno=rows[0].admission_no;
          console.log("admissionno............."+admnno);
          connection.query('UPDATE md_admission SET ? WHERE ? and ? and ?',[admnupdate,enquiryno,schoolid,acyear],function(err, rows){
          if(!err){
          connection.query('UPDATE md_student SET ? WHERE ? and ? and ?',[studupdate,enquiryno,schoolid,acyear],function(err, rows){
          if(!err){
          console.log('========='+admnno.admissionno);
          connection.query("UPDATE md_student_paidfee SET ? WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academicyear+"' and (admission_no='"+admnno.admissionno+"' or admission_no='"+req.query.enquiryno+"')",[feeupdate],function(err, rows){
          if(!err)
          res.status(200).json({'returnval': 'Updated!!'});
          else{
          console.log(err);
          res.status(200).json({'returnval': 'Unable to update!!'});
          }
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
        });
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
   connection.query("SELECT * FROM followupdetail d join followup f WHERE f.school_id =  '"+req.query.schol+"' and f.id='"+req.query.folowid+"' and d.school_id =  '"+req.query.schol+"' and d.schedule_id='"+req.query.folowid+"' and d.followup_status!='Cancelled' order by(str_to_date(d.schedule_date,'%d-%m-%Y'))",
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

app.post('/updatefollowupschedule-service',  urlencodedParser,function (req, res){
  var response={
    schedule_date:req.query.scheduledate,
    next_followup_date:req.query.nextfollowupdate
  };
  var response1={
    upcoming_date:req.query.upcomingdate,
    last_schedule_date:req.query.lastscheduledate
  };

  var qur1="UPDATE followup SET upcoming_date='"+req.query.upcomingdate+"',last_schedule_date='"+req.query.lastscheduledate+"' WHERE enquiry_id='"+req.query.enquiryid+"' AND school_id='"+req.query.schol+"' AND id='"+req.query.followupid+"' AND schedule_no='"+req.query.scheduleid+"'";
  var qur2="UPDATE followupdetail SET schedule_date='"+req.query.scheduledate+"' , next_followup_date='"+req.query.nextfollowupdate+"' WHERE enquiry_id='"+req.query.enquiryid+"' AND school_id='"+req.query.schol+"' AND schedule_id='"+req.query.followupid+"' AND schedule='"+req.query.scheduleid+"' AND followup_no='"+req.query.followupno+"'";
   console.log(qur1);
   console.log('--------------------------------------');
   console.log(qur2);
   console.log('--------------------------------------');
   connection.query(qur1,function(err, result)
     {
       if(!err)
       {
        if(result.affectedRows>0){
         connection.query(qur2,function(err, result)
         {
          //console.log(rows);
          if(!err){
          if(result.affectedRows>0){
           res.status(200).json({'returnval': 'updated'});
          }
          }
          else
            console.log(err);
         });
        }
         }
         else
         {
           console.log(err);
           res.status(200).json({'returnval':null});
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
   connection.query("SELECT * FROM fee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' and fee_type not in('Registration fee','Caution deposit')",
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
  var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and (admission_no='"+req.query.admissionno+"' or enquiry_no like '"+req.query.admissionno+"') and cheque_status in ('paid','inprogress','cleared')";
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
  "or enquiry_no like '"+req.query.admissionno+"')) as mothername,(select father_name from student_enquiry_details where school_id='"+req.query.schoolid+"' "+
  "and academic_year='"+req.query.academicyear+"' and (enquiry_no like '"+req.query.admissionno+"')) "+ 
  " as fathername1,(select mother_name from student_enquiry_details where school_id='"+req.query.schoolid+"' "+
  "and academic_year='"+req.query.academicyear+"' and (enquiry_no like '"+req.query.admissionno+"')) "+
  " as mothername1 FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and (admission_no='"+req.query.admissionno+"' or enquiry_no like '"+req.query.admissionno+"') and cheque_status in('paid','inprogress','cleared') ";
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
   var qur = "SELECT * FROM md_student_paidfee where installment_date>='"+req.query.fromdate+"' "+
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
   var paidqur = "select payment_through,installment_pattern,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_no not like '%ENQ%' and installment not in('Registration fee','Caution deposit') group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status='Admitted'"+
    " group by pf.admission_no";
   }
   if(req.query.type=='New'){
    var paidqur = "select  payment_through,installment_pattern,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount   from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_no not like '%ENQ%' and admission_status='New' and installment not in('Registration fee','Caution deposit') group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and admission_status='New' and pf.discount_type not in('3') and pf.active_status='Admitted'"+
    " group by pf.admission_no";
   }
   if(req.query.type=='Promoted'){
    var paidqur = "select  payment_through,installment_pattern,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_no not like '%ENQ%' and admission_status='Promoted' and installment not in('Registration fee','Caution deposit') group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and admission_status='Promoted' and pf.discount_type not in('3') and pf.active_status='Admitted'"+
    " group by pf.admission_no";
   }
   var inspaidqur="select admission_no,student_name,grade,installment,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('inprogress','paid') and cheque_status not in('bounced','cancelled') and installment not in('Registration fee','Caution deposit') group by school_id,admission_no,student_name,grade,installment";
   var pendingqur = "select admission_no,student_name,grade,installment,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('inprogress') and cheque_status in('bounced','cancelled') and installment not in('Registration fee','Caution deposit') group by school_id,admission_no,student_name,grade,installment";
   var qur="select * from fee_splitup where school_id='"+req.query.schoolid+"' and fee_type in('Registration fee','Caution deposit')";
   var feesplitqur="select sum(amount) as amount,base_fee_type,fee_code,grade from md_fee_splitup_master where school_id='"+req.query.schoolid+"' and fee_type not in('Registration fee','Caution deposit') and academic_year='"+req.query.academicyear+"' group by fee_code,base_fee_type,grade";
  }
  else{
    console.log('spec grades...................');
   // var totalqur = "select admission_no,student_name,grade,sum(actual_amount) as actualamount,sum(discount_amount) as discountamount,sum(installment_amount) as payableamount from "+
   // "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and cheque_status not in('bounced') group by school_id,admission_no,student_name,grade";
   if(req.query.type=='All'){
   var paidqur = "select  payment_through,installment_pattern,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount ,sum(difference_amount) as diffamount from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_no not like '%ENQ%' and installment not in('Registration fee','Caution deposit') group by school_id,admission_no,student_name";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status='Admitted'"+
    " and pf.class_for_admission='"+req.query.grade+"' group by pf.admission_no" ;
   }
   if(req.query.type=='New'){
   var paidqur = "select  payment_through,installment_pattern,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_no not like '%ENQ%' and admission_status='New' and installment not in('Registration fee','Caution deposit') group by school_id,admission_no,student_name";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status='Admitted'"+
    " and pf.class_for_admission='"+req.query.grade+"' and admission_status='New' group by pf.admission_no" ;
   }
   if(req.query.type=='Promoted'){
   var paidqur = "select  payment_through,installment_pattern,admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_no not like '%ENQ%' and admission_status='Promoted' and installment not in('Registration fee','Caution deposit') group by school_id,admission_no,student_name";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status='Admitted'"+
    " and pf.class_for_admission='"+req.query.grade+"' and admission_status='Promoted' group by pf.admission_no" ;
   }
   var inspaidqur="select admission_no,student_name,grade,installment,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' AND school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and  paid_status in "+
   "('inprogress','paid') and cheque_status not in('bounced','cancelled')  group by school_id,admission_no,student_name,grade,installment";
   var pendingqur = "select admission_no,student_name,grade,installment,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where paymenttype_flag!='2' and academic_year='"+req.query.academicyear+"' AND school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and  paid_status in "+
   "('inprogress') and cheque_status in('bounced','cancelled')  group by school_id,admission_no,student_name,grade,installment";
   var qur="select * from fee_splitup where school_id='"+req.query.schoolid+"' and fee_type in('Registration fee','Caution deposit') ";
   var feesplitqur="select sum(amount) as amount,base_fee_type,fee_code,grade from md_fee_splitup_master where school_id='"+req.query.schoolid+"' and fee_type not in('Registration fee','Caution deposit') and academic_year='"+req.query.academicyear+"' group by fee_code,base_fee_type,grade";
   }
 console.log('-----------------------pending fee report--------------------------');
 console.log(totalqur);
 console.log('-------------------------------------------------');
  console.log(paidqur);
 console.log('-------------------------------------------------');
  console.log(pendingqur);
 console.log('-------------------------------------------------');
 console.log(feesplitqur);
 console.log('-------------------------------------------------');
 var totalarr=[];
 var paidarr=[];
 var pendingarr=[];
 var regfeearr=[];
 var feesplitup=[];
   connection.query(totalqur,function(err, rows){
       if(!err){         
          totalarr=rows;
          connection.query(paidqur,function(err, rows){
            if(!err){
              paidarr=rows;
              connection.query(pendingqur,function(err, rows){
              if(!err){
              pendingarr=rows;
              connection.query(qur,function(err, rows){
              if(!err){
              regfeearr=rows;
              connection.query(feesplitqur,function(err, rows){
              if(!err){
              feesplitup=rows;
              connection.query(inspaidqur,function(err, rows){
              if(!err){
              res.status(200).json({'feesplitup':feesplitup,'regfee':regfeearr,'totalarr':totalarr,'paidarr':paidarr,'pendingarr':pendingarr,'inspaidarr':rows});
              }
              });
              }
              else
                console.log("one...."+err);
              });
              }
              else
                console.log("two...."+err);
              });
              // res.status(200).json({'totalarr':totalarr,'paidarr':paidarr,'pendingarr':pendingarr});
              }
              else
                console.log("three...."+err);
              });
            }
            else
                console.log("four...."+err);
          });
        }
       else{
         console.log("five...."+err);
       }
     });
 });

app.post('/dailycollectionreport-service',  urlencodedParser,function (req, res){
 if(req.query.grade=="All Grades")
 var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
             "and paid_date<='"+req.query.todate+"' and school_id='"+req.query.schoolid+"' and paid_status in('paid','cleared','inprogress')";
 else
 var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
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
   var qur = "SELECT * FROM md_student_paidfee where paid_date>='"+req.query.fromdate+"' "+
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
 var qur = "SELECT * FROM md_student_paidfee where STR_TO_DATE(cheque_date,'%m/%d/%Y')=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') "+
           "and school_id='"+req.query.schoolid+"' and pdc_flag='2' and cheque_status not in('bounced','cancelled')";
 else
 var qur = "SELECT * FROM md_student_paidfee where "+
           "STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') "+
           "and school_id='"+req.query.schoolid+"' and pdc_flag='2' and cheque_status not in('bounced','cancelled')";
 }
 if(req.query.filterby=="Received Date"){
 if(req.query.flag==0)
 var qur = "SELECT * FROM md_student_paidfee where STR_TO_DATE(paid_date,'%m/%d/%Y')=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') "+
           "and school_id='"+req.query.schoolid+"' and pdc_flag='2' and cheque_status not in('bounced','cancelled')";
 else
 var qur = "SELECT * FROM md_student_paidfee where "+
           "STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y') "+
           "and school_id='"+req.query.schoolid+"' and pdc_flag='2' and cheque_status not in('bounced','cancelled')";
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
 var qur = "SELECT * FROM md_student_paidfee where  cheque_date='"+req.query.fromdate+"' "+
           "and school_id='"+req.query.schoolid+"' and cheque_status in('inprogress') and cheque_status not in('bounced','cancelled')";
 else
 var qur = "SELECT * FROM md_student_paidfee where  "+
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
 var qur = "SELECT * FROM md_discount_master where academic_year='"+req.query.academicyear+"'  and (from_date>='"+req.query.fromdate+"' "+
             "or to_date<='"+req.query.todate+"') and school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear=="All"&&req.query.grade!="all")
 var qur = "SELECT * FROM md_discount_master where academic_year='"+req.query.academicyear+"'  and grade='"+req.query.grade+"' and (from_date>='"+req.query.fromdate+"' "+
             "or to_date<='"+req.query.todate+"') and school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear!="All"&&req.query.grade!="all")
 var qur = "SELECT * FROM md_discount_master where academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and grade='"+req.query.grade+"' and (from_date>='"+req.query.fromdate+"' "+
             "or to_date<='"+req.query.todate+"') and school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear!="All"&&req.query.grade=="all")
 var qur = "SELECT * FROM md_discount_master where academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and (from_date>='"+req.query.fromdate+"' "+
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

 var titlequr="SELECT distinct(fee_type) FROM md_fee_type where school_id='"+req.query.schoolid+"'"; 
 if(req.query.admissionyear=='All'&&req.query.grade=="all")
 var qur = "SELECT * FROM fee_master fm join "+
 "fee_splitup fs on (fm.fee_code=fs.fee_code) where fm.academic_year='"+req.query.academicyear+"' "+
 " and fm.school_id='"+req.query.schoolid+"' and fs.school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear=='All'&&req.query.grade!="all")
 var qur = "SELECT * FROM fee_master fm join "+
 "fee_splitup fs on (fm.fee_code=fs.fee_code) where fm.academic_year='"+req.query.academicyear+"' "+
 " and grade_id='"+req.query.grade+"' and fm.school_id='"+req.query.schoolid+"' and fs.school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear!='All'&&req.query.grade!="all")
 var qur = "SELECT * FROM fee_master fm join "+
 "fee_splitup fs on (fm.fee_code=fs.fee_code) where fm.academic_year='"+req.query.academicyear+"' and fm.admission_year='"+req.query.admissionyear+"' "+
 " and grade_id='"+req.query.grade+"' and fm.school_id='"+req.query.schoolid+"' and fs.school_id='"+req.query.schoolid+"' ";
 else if(req.query.admissionyear!='All'&&req.query.grade=="all")
 var qur = "SELECT * FROM fee_master fm join "+
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
  var qur="UPDATE md_student_paidfee SET cheque_no='"+req.query.chequeno+"',bank_name='"+req.query.bankname+"',cheque_date='"+req.query.chequedate+"',installment_amount='"+req.query.amount+"' where school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and installment='"+req.query.installment+"' ";
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
  
  var qur="DELETE FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and cheque_no='"+req.query.chequeno+"' and installment='"+req.query.installmenttype+"'";
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
              var status=rows[0].admission_status;
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
                  if(!err){
                  if(result.affectedRows>0){
                  connection.query("UPDATE md_student_paidfee set paid_status='cancelled',cheque_status='cancelled' WHERE (admission_no='"+req.query.admissionno+"' or admission_no='"+enquiryno+"') and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'",function(err, result){
                  if(!err)
                  res.status(200).json({'returnval': 'Cancelled!'});
                  else
                  res.status(200).json({'returnval': 'Unable to Cancel!'});
                  });
                  }
                  else
                  res.status(200).json({'returnval': 'Unable to Cancel!'}); 
                  }
                  else
                    console.log(err);
                  
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
                  connection.query("UPDATE md_student_paidfee set paid_status='cancelled',cheque_status='cancelled' WHERE admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'",function(err, result){
                  if(!err)
                  res.status(200).json({'returnval': 'Cancelled!'});
                  else
                  res.status(200).json({'returnval': 'Unable to Cancel!'}); 
                  });
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
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in ('Admitted','Default')";
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
  var qur="SELECT *,(SELECT sum(s.total_fee) FROM fee_splitup s WHERE s.fee_code=f.fee_code and fee_type not "+
  " in('Registration fee')) as totalfee,(SELECT grade_name from grade_master WHERE grade_id=f.grade_id) as grade "+
  " FROM fee_master f WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  // var qur="SELECT *,(SELECT grade_name from grade_master WHERE grade_id=f.grade_id) as grade FROM fee_master f WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' ";
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
  if(req.query.grade=='All Grades'){
  if(req.query.type=="All")
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.active_status in ('Admitted') order by a.class_for_admission";
  else
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.admission_status='"+req.query.type+"' and a.active_status in ('Admitted') order by a.class_for_admission";
  }
  else{
  if(req.query.type=="All")
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.class_for_admission='"+req.query.grade+"' and s.class_for_admission='"+req.query.grade+"' and a.active_status in ('Admitted') order by a.class_for_admission";
  else
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.class_for_admission='"+req.query.grade+"' and s.class_for_admission='"+req.query.grade+"' and a.admission_status='"+req.query.type+"' and a.active_status in ('Admitted') order by a.class_for_admission";
  }
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  
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

app.post('/fetchalltc-service',  urlencodedParser,function (req, res){
  if(req.query.grade=='All Grades'){
  if(req.query.type=="All")
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.active_status in ('cancelled') order by a.class_for_admission";
  else
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.admission_status='"+req.query.type+"' and a.active_status in ('cancelled') order by a.class_for_admission";
  }
  else{
  if(req.query.type=="All")
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.class_for_admission='"+req.query.grade+"' and s.class_for_admission='"+req.query.grade+"' and a.active_status in ('cancelled') order by a.class_for_admission";
  else
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.class_for_admission='"+req.query.grade+"' and s.class_for_admission='"+req.query.grade+"' and a.admission_status='"+req.query.type+"' and a.active_status in ('cancelled') order by a.class_for_admission";
  }
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  
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

app.post('/fetchallwithdrawn-service',  urlencodedParser,function (req, res){
  if(req.query.grade=='All Grades'){
  if(req.query.type=="All")
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.active_status in ('withdrawn') order by a.class_for_admission";
  else
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.admission_status='"+req.query.type+"' and a.active_status in ('withdrawn') order by a.class_for_admission";
  }
  else{
  if(req.query.type=="All")
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.class_for_admission='"+req.query.grade+"' and s.class_for_admission='"+req.query.grade+"' and a.active_status in ('withdrawn') order by a.class_for_admission";
  else
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.class_for_admission='"+req.query.grade+"' and s.class_for_admission='"+req.query.grade+"' and a.admission_status='"+req.query.type+"' and a.active_status in ('withdrawn') order by a.class_for_admission";
  }
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  
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

app.post('/fetchallrte-service',  urlencodedParser,function (req, res){
  if(req.query.grade=='All Grades'){
  if(req.query.type=="All")
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.active_status in ('Admitted') and a.discount_type='3' order by a.class_for_admission";
  else
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.admission_status='"+req.query.type+"' and a.active_status in ('Admitted') and a.discount_type='3' order by a.class_for_admission";
  }
  else{
  if(req.query.type=="All")
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.class_for_admission='"+req.query.grade+"' and s.class_for_admission='"+req.query.grade+"' and a.active_status in ('Admitted') and a.discount_type='3' order by a.class_for_admission";
  else
  var qur="SELECT * FROM md_admission a join md_student s on(s.admission_no=a.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and s.academic_year='"+req.query.academicyear+"' and a.class_for_admission='"+req.query.grade+"' and s.class_for_admission='"+req.query.grade+"' and a.admission_status='"+req.query.type+"' and a.active_status in ('Admitted') and a.discount_type='3' order by a.class_for_admission";
  }
  console.log('------------------------------------------------------');
  console.log(qur);
  console.log('------------------------------------------------------');
  
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


app.post('/dailyenrollmentdashboard-service',  urlencodedParser,function (req, res){
  var qur1="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and STR_TO_DATE(created_on,'%Y-%m-%d')=STR_TO_DATE(sysdate(),'%Y-%m-%d') group by class_for_admission";
  var qur2="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status not in('Default','Discontinued') and admission_status='New' group by class_for_admission";
  var qur3="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Withdrawn') and admission_status='New' group by class_for_admission";
  var qur4="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and admission_status='New' group by class_for_admission";
  var qur5="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Provision') and admission_status='New' group by class_for_admission";
 console.log('------------------------------------------');
  console.log(qur1);
  console.log(qur2);
  console.log(qur3);
  console.log(qur4);
  console.log(qur5);
  var afday=[];
  var noadmn=[];
  var nowith=[];
  var totadmn=[];
  var proadmn=[];
  connection.query(qur1,function(err, rows){
      if(!err){
      afday=rows;
      connection.query(qur2,function(err, rows){
      if(!err){
        noadmn=rows;
      connection.query(qur3,function(err, rows){
      if(!err){
        nowith=rows;
      connection.query(qur4,function(err, rows){
      if(!err){
        totadmn=rows;
        connection.query(qur5,function(err, rows){
        if(!err){
        proadmn=rows;
        res.status(200).json({'afday':afday,'noadmn':noadmn,'nowith':nowith,'totadmn':totadmn,'proadmn':proadmn}); 
        }
        });
      }
      });
      }
      });
      }
      });
      } 
      else {
        console.log(err);
      }
  });
});

app.post('/dailyenrollmentdashboard-service1',  urlencodedParser,function (req, res){
  var qur1="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='Promoted' and active_status not in('Discontinued','Default') group by class_for_admission";
  var qur2="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('cancelled') and admission_status='Promoted' group by class_for_admission";
  var qur3="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and discount_type='3' group by class_for_admission";
  var qur4="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and admission_status='Promoted' group by class_for_admission";
  var qur5="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and admission_status in('New','Promoted') group by class_for_admission";
  var qur="SELECT distinct(class_for_admission) as grade FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' order by class_for_admission";
  console.log(qur);
  console.log(qur1);
  console.log(qur2);
  console.log(qur3);
  console.log(qur4);
  console.log(qur5);
  var totrollover=[];
  var tc=[];
  var rte=[];
  var rolloverstrength=[];
  var totstrength=[];
  connection.query(qur1,function(err, rows){
      if(!err){
      totrollover=rows;
      connection.query(qur2,function(err, rows){
      if(!err){
        tc=rows;
      connection.query(qur3,function(err, rows){
      if(!err){
        rte=rows;
      connection.query(qur4,function(err, rows){
      if(!err){
        rolloverstrength=rows;
        connection.query(qur5,function(err, rows){
        if(!err){
        totstrength=rows;
        connection.query(qur,function(err, rows){
        if(!err){
        res.status(200).json({'totrollover':totrollover,'tc':tc,'rte':rte,'rolloverstrength':rolloverstrength,'totstrength':totstrength,'grade':rows}); 
        }
        });
        }
        });
      }
      });
      }
      });
      }
      });
      } 
      else {
        console.log(err);
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
  var checkqur="SELECT * FROM md_studentwise_installment_splitup"+
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
    var admncount="SELECT count(*) as totaladmissioncount FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and discount_type not in('3') and active_status in ('Admitted')";
    var totalpaid="SELECT count(distinct(admission_no)) as totalpaidcount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress')";
    var totalpaidamount="SELECT sum(installment_amount)-sum(difference_amount) as totalpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress')";
    var patternpaid="SELECT installment_pattern,count(distinct(admission_no)) as patternadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress') group by installment_pattern";
    var patternpaidamount="SELECT installment_pattern,sum(installment_amount)-sum(difference_amount) as patternpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress') group by installment_pattern";
  }
  if(req.query.type=="All"&&req.query.grade!="All Grades"){
    console.log('2');
    var admncount="SELECT count(*) as totaladmissioncount  FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and discount_type not in('3') and active_status in ('Admitted')";
    var totalpaid="SELECT count(distinct(admission_no)) as totalpaidcount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress')";
    var totalpaidamount="SELECT sum(installment_amount)-sum(difference_amount) as totalpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress')";
    var patternpaid="SELECT installment_pattern,count(distinct(admission_no))  as patternadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress') group by installment_pattern";
    var patternpaidamount="SELECT installment_pattern,sum(installment_amount)-sum(difference_amount) as patternpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment not in('Application fee','Registration Fee','Caution report') and cheque_status in('paid','inprogress') group by installment_pattern";
  }
  if(req.query.type!="All"&&req.query.grade=="All Grades"){
    console.log('3');
    var admncount="SELECT count(*) as totaladmissioncount FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and discount_type not in('3') and active_status in ('Admitted')";    
    var totalpaid="SELECT count(distinct(admission_no)) as totalpaidcount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress')";
    var totalpaidamount="SELECT sum(installment_amount)-sum(difference_amount) as totalpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress')";
    var patternpaid="SELECT installment_pattern,count(distinct(admission_no)) as patternadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress') group by installment_pattern";
    var patternpaidamount="SELECT installment_pattern,sum(installment_amount)-sum(difference_amount) as patternpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress') group by installment_pattern";
  }
  if(req.query.type!="All"&&req.query.grade!="All Grades"){
    console.log('4');
    var admncount="SELECT count(*) as totaladmissioncount FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and grade='"+req.query.grade+"' and discount_type not in('3') and active_status in ('Admitted')";    
    var totalpaid="SELECT count(distinct(admission_no)) as totalpaidcount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress')";
    var totalpaidamount="SELECT sum(installment_amount)-sum(difference_amount) as totalpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress')";
    var patternpaid="SELECT installment_pattern,count(distinct(admission_no))  as patternadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress') group by installment_pattern";
    var patternpaidamount="SELECT installment_pattern,sum(installment_amount)-sum(difference_amount) as patternpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment not in('Application fee','Registration Fee','Caution deposit') and cheque_status in('paid','inprogress') group by installment_pattern";
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
    var neevpaid="SELECT count(distinct(admission_no)) as neevadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment not in('Application fee','Registration fee','Caution deposit') and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var neevpaidamount="SELECT sum(installment_amount)-sum(difference_amount) as neevpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment not in('Application fee','Registration fee','Caution deposit') and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var paytmpaid="SELECT count(distinct(admission_no)) as paytmadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment not in('Application fee','Registration fee','Caution deposit') and bank_name='paytm' ";
    var paytmpaidamount="SELECT sum(installment_amount) as paytmpaidamount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and installment not in('Application fee','Registration fee','Caution deposit') and bank_name='paytm' ";
  }
  if(req.query.type=="All"&&req.query.grade!="All Grades"){
    console.log('12');
    var neevpaid="SELECT count(distinct(admission_no)) as neevadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment not in('Application fee','Registration fee','Caution deposit') and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var neevpaidamount="SELECT sum(installment_amount)-sum(difference_amount) as neevpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment not in('Application fee','Registration fee','Caution deposit') and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var paytmpaid="SELECT count(distinct(admission_no)) as paytmadmncount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment not in('Application fee','Registration fee','Caution deposit') and bank_name='paytm' ";
    var paytmpaidamount="SELECT sum(installment_amount) as paytmpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and installment not in('Application fee','Registration fee','Caution deposit') and bank_name='paytm' ";
  }
  if(req.query.type!="All"&&req.query.grade=="All Grades"){
    console.log('13');
    var neevpaid="SELECT count(distinct(admission_no)) as neevadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment not in('Application fee','Registration fee','Caution deposit') and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var neevpaidamount="SELECT sum(installment_amount)-sum(difference_amount) as neevpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment not in('Application fee','Registration fee','Caution deposit') and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var paytmpaid="SELECT count(distinct(admission_no)) as paytmadmncount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment not in('Application fee','Registration fee','Caution deposit') and bank_name='paytm'";
    var paytmpaidamount="SELECT sum(installment_amount) as paytmpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and installment not in('Application fee','Registration fee','Caution deposit') and bank_name='paytm'";
  }
  if(req.query.type!="All"&&req.query.grade!="All Grades"){
    console.log('14');
    var neevpaid="SELECT count(distinct(admission_no)) as neevadmncount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment not in('Application fee','Registration fee','Caution deposit') and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var neevpaidamount="SELECT sum(installment_amount)-sum(difference_amount) as neevpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment not in('Application fee','Registration fee','Caution deposit') and mode_of_payment='Third Party' and payment_through='thirdparty'";
    var paytmpaid="SELECT count(distinct(admission_no)) as paytmadmncount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment not in('Application fee','Registration fee','Caution deposit') and bank_name='paytm'";
    var paytmpaidamount="SELECT sum(installment_amount) as paytmpaidamount  FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"'  and grade='"+req.query.grade+"' and installment not in('Application fee','Registration fee','Caution deposit') and bank_name='paytm'";
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
    totalfee:req.query.total,
    fee_code:req.query.feecode
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

  var updatequery="update due_report set discountkitfee=(kitfee-(commitkitfee)), "+
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

  var updatequery="update due_report set discountkitfee=(kitfee-(commitkitfee)), "+
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

  var updatequery="update due_report set discountkitfee=(kitfee-(commitkitfee)), "+
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


// app.post('/updatenonpaidfee-service',  urlencodedParser,function (req, res){

//   var schoolid={school_id:req.query.schoolid};

//   var updatequery="update mlzscrm.due_report set discountkitfee='0',discountannualfee='0',discounttutionfee='0',discounttotal='0', "+
//   " commitkitfee='0',commitannualfee='0',ins1annualfee='0',ins1tutionfee='0', "+
//   " ins2annualfee='0',ins2tutionfee='0',ins3annualfee='0',ins3tutionfee='0', "+
//   " WHERE school_id='"+req.query.schoolid+"' and pattern_flag is null";
//   console.log('-----------non paid update-------------');
//   console.log(updatequery); 
//   connection.query(updatequery,function(err, result){
//       if(!err){   
//         res.status(200).json({'returnval': 'Updated!'});
//       } else {
//         console.log(err);
//       }
//   });
// });

app.post('/fetchnonpaidfeecode-service',  urlencodedParser,function (req, res){
  var schoolid={school_id:req.query.schoolid};
  var fetchquery="select * from due_report where school_id='"+req.query.schoolid+"' and acttotalpaidfee is null";
  // var fetchquery1="select * from mlzscrm.due_report where school_id='"+req.query.schoolid+"' and acttotalpaidfee is null";
  console.log('----------- fetch non paid -------------');
  console.log(fetchquery); 
  connection.query(fetchquery,function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
      }
  });
});

app.post('/fetchnonpaidfeecodestructure-service',  urlencodedParser,function (req, res){
  var schoolid={school_id:req.query.schoolid};
  var fetchquery="select * from md_fee_splitup_master where school_id='"+req.query.schoolid+"'";
  console.log('----------- fetch non paid -------------');
  console.log(fetchquery); 
  connection.query(fetchquery,function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
      }
  });
});

app.post('/updatenonpaidfee-service',  urlencodedParser,function (req, res){
  var schoolid={school_id:req.query.schoolid};
  var updatequery="update due_report set actcommitkitfee='"+req.query.commitkitfee+"',actcommitannualfee='"+req.query.commitannualfee+"', "+
  " actins1annualfee='"+req.query.ins1annualfee+"',actins1tutionfee='"+req.query.ins1tutionfee+"', "+
  " actins2annualfee='"+req.query.ins2annualfee+"',actins2tutionfee='"+req.query.ins2tutionfee+"' , "+
  " actins3annualfee='"+req.query.ins3annualfee+"',actins3tutionfee='"+req.query.ins3tutionfee+"', "+
  " duecommitkitfee='"+req.query.commitkitfee+"',duecommitannualfee='"+req.query.commitannualfee+"', "+
  " dueins1annualfee='"+req.query.ins1annualfee+"',dueins1tutionfee='"+req.query.ins1tutionfee+"', "+
  " dueins2annualfee='"+req.query.ins2annualfee+"',dueins2tutionfee='"+req.query.ins2tutionfee+"' , "+
  " dueins3annualfee='"+req.query.ins3annualfee+"',dueins3tutionfee='"+req.query.ins3tutionfee+"',duetotalpaidfee=totalfee,pattern_flag='NP'  "+
  " where admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"'";
  console.log('----------- update non paid -------------');
  console.log(updatequery); 
  connection.query(updatequery,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
  });
});

app.post('/updatenonpaidotherfee-service',  urlencodedParser,function (req, res){
  var schoolid={school_id:req.query.schoolid};
  var updatequery="update due_report set discountkitfee=0,discountannualfee=0,discounttutionfee=0, "+
  " discounttotal=0,commitkitfee=0,commitannualfee=0,ins1annualfee=0,ins1tutionfee=0, "+
  " ins2annualfee=0,ins2tutionfee=0,ins3annualfee=0,ins3tutionfee=0,totalpaidfee=0 WHERE school_id='"+req.query.schoolid+"' and totalpaidfee is null";
  console.log('-----------non paid update-------------');
  console.log(updatequery); 
  connection.query(updatequery,function(err, result){
      if(!err){   
        res.status(200).json({'returnval': 'Updated!'});
      } else {
        console.log(err);
      }
  });
});

app.post('/fetchthirdparty-service',  urlencodedParser,function (req, res){
  var schoolid={school_id:req.query.schoolid};
  var fetchquery="select distinct(s.admission_no) from due_report d "+
  " join md_student_paidfee s on(d.admission_no=s.admission_no) "+
  " where s.payment_through='thirdparty' and s.mode_of_payment='Third Party' and s.school_id='"+req.query.schoolid+"' and d.school_id='"+req.query.schoolid+"'";
  console.log('-----------fetch tp stud-------------');
  console.log(fetchquery); 
  connection.query(fetchquery,function(err, rows){
      if(!err){   
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
      }
  });
});

app.post('/updatethirdparty-service',  urlencodedParser,function (req, res){
  var schoolid={school_id:req.query.schoolid};
  var updatequery="update due_report set payment_through='Paid through NEEV' "+
  " where admission_no='"+req.query.admissionno+"' and school_id='"+req.query.schoolid+"' ";
  console.log('-----------tp update-------------');
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
  var qur2="SELECT *,(select grade_name from grade_master where grade_id=grade) as gradename FROM md_fee_splitup_master where school_id='"+req.query.schoolid+"'";
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

  var qur2="SELECT *,(select grade_name from grade_master where grade_id=grade) as gradename FROM md_fee_splitup_master where school_id='"+req.query.schoolid+"'";

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
  "from student_enquiry_details where status='Enquired' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and enquired_date is not null "+
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
  "from student_enquiry_details where status='Admitted' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and enquired_date is not null "+
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
  var totalqur="SELECT grade,count(*) as cnt,sum(totalfee) as total FROM due_report where "+
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
  var totalqur="SELECT grade,count(*) as cnt,sum(totalfee) as total FROM due_report where "+
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
  var totalqur="SELECT grade,count(*) as cnt,sum(totalfee) as total FROM due_report where "+
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
  var totalqur="SELECT grade,count(*) as cnt,sum(totalfee) as total FROM due_report where "+
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
  password:req.query.password,
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


app.post('/fetchzone-service',  urlencodedParser,function (req, res){
 
 var qur="SELECT * FROM transport.md_zone WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
 console.log(qur);
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

app.post('/fetchzonefee-service',  urlencodedParser,function (req, res){
 
 var qur="SELECT * FROM transport.md_distance WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and id='"+req.query.distanceid+"'";
 console.log(qur);
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


app.post('/inserttransportsch-service',  urlencodedParser,function (req, res){
var response={
  school_id:req.query.schoolid,
  academic_year:req.query.academicyear,
  distance_id:req.query.distanceid,
  zone_name:req.query.zonename,
  installment:req.query.installment,
  installment_date:req.query.installmentdate,
  amount:req.query.amount,
  schedule_for:req.query.insfor,
  fee_type: 'Transport Fee',
  type: 'Recurring'
}; 
 var checkqur="SELECT * FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
 " distance_id='"+req.query.distanceid+"' and zone_name='"+req.query.zonename+"' and installment='"+req.query.installment+"' and schedule_for='"+req.query.insfor+"'";
 console.log('-----------------------------------------------');
 console.log(checkqur);
 console.log('-----------------------------------------------');
 var qur="INSERT INTO transport_fee_schedule SET ?";
 console.log(qur);
 console.log('-----------------------------------------------');
 connection.query(checkqur,function(err, rows){
 if(rows.length==0){
 connection.query(qur,[response],
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
 }
 else{
  res.status(200).json({'returnval': 'already exist!!'});
 }
});
});

app.post('/deletetransportfeeschedule-service',  urlencodedParser,function (req, res){
 
 var qur="DELETE FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
 " distance_id='"+req.query.distanceid+"' and zone_name='"+req.query.zonename+"' and schedule_for='"+req.query.insfor+"'";
 console.log(qur);
 connection.query(qur,
    function(err, result)
    {
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Deleted!!'});
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to Delete!!'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/fetchtransportfeesearch-service',  urlencodedParser,function (req, res){
 
 var qur="SELECT * FROM transport.student_fee f join transport.student_details d on(f.student_id=d.id) "+
 " where f.school_id=d.school_id and f.academic_year=d.academic_year and f.status='mapped' and "+
 " f.academic_year='"+req.query.academicyear+"' and f.school_id='"+req.query.schoolid+"' "+
 " and d.academic_year='"+req.query.academicyear+"' and d.school_id='"+req.query.schoolid+"'";
 console.log(qur);
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

app.post('/searchtransportfeepaidinfo-service',  urlencodedParser,function (req, res){
 var qur="SELECT * FROM transport.student_fee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and student_id='"+req.query.studentid+"' and "+
 " status='mapped' and ((install1_status in('processing','paid')) or (install2_status in('processing','paid'))) ";
 var qur1="SELECT * FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
 console.log(qur);
 var paidarr=[];
 connection.query(qur,function(err, rows)
    {
      if(!err)
      {
        if(rows.length==0){
          res.status(200).json({'paidarr': "no rows",'paidcheque': "no rows"});
        }
        else{
          paidarr=rows;
          connection.query(qur1,function(err, rows){
          if(!err){
          res.status(200).json({'paidarr': paidarr,'paidcheque': rows});
          }
          });
        } 
      } 
      else
      {
        console.log(err);
      }
    });
});


app.post('/fetchtransportfees-service',  urlencodedParser,function (req, res){
 
 var qur1="SELECT zone_name from transport.md_zone where id in(SELECT zone_id FROM transport.student_fee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"') and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"'";
 // var qur2="SELECT * FROM transport_fee_schedule";
 console.log(qur1);
 var feesplit=[];
 var zonename="";
 var studinfo=[];
 connection.query("SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'",function(err, rows){
 if(!err){
 if(rows.length>0){
 studinfo=rows;
 connection.query(qur1,function(err, rows){
      if(!err){
        if(rows.length>0){
          zonename=rows[0].zone_name;
          connection.query("SELECT * FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and zone_name='"+zonename+"'",function(err, rows){
          if(!err){
          if(rows.length>0){
          feesplit=rows;
          connection.query("SELECT sum(amount) as total FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and zone_name='"+zonename+"'",function(err, rows){
          if(!err)            
          res.status(200).json({'studinfo':studinfo,'total': rows[0].total,'zonename':zonename,'feesplit':feesplit});
          });
          }
          else
          res.status(200).json({'returnval': 'no rows'});
          }
        });
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } 
      else {
        console.log(err);
      }
    });
  }
  }
  });
});

app.post('/searchtransportfeepaidinfo-service1',  urlencodedParser,function (req, res){
 var qur="SELECT * FROM transport.student_fee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"' and "+
 " status='mapped' and ((install1_status in('processing','paid','bounce','cancel')) or (install2_status in('processing','paid','bounce','cancel'))) ";
 var qur1="SELECT * FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and name='"+req.query.studentname+"'";
 console.log('---------------------------------------------------');
 console.log(qur);
 console.log('---------------------------------------------------');
 console.log(qur1);
 var paidarr=[];
 connection.query(qur,function(err, rows)
    {
      if(!err)
      {
        if(rows.length==0){
          res.status(200).json({'paidarr': "no rows",'paidcheque': "no rows"});
        }
        else{
          paidarr=rows;
          connection.query(qur1,function(err, rows){
          if(!err){
          res.status(200).json({'paidarr': paidarr,'paidcheque': rows});
          }
          });
        } 
      } 
      else
      {
        console.log(err);
      }
    });
});


app.post('/fetchtransportfees-service1',  urlencodedParser,function (req, res){
 
 var qur1="SELECT zone_name from transport.md_zone where id in(SELECT zone_id FROM transport.student_fee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"') and academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"'";
 // var qur2="SELECT * FROM transport_fee_schedule";
 console.log(qur1);
 var feesplit=[];
 var zonename="";
 var studinfo=[];
 connection.query("SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'",function(err, rows){
 if(!err){
 if(rows.length>0){
 studinfo=rows;
 connection.query(qur1,function(err, rows){
      if(!err){
        if(rows.length>0){
          zonename=rows[0].zone_name;
          connection.query("SELECT * FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and zone_name='"+zonename+"' and schedule_for='"+req.query.studentid+"'",function(err, rows){
            if(rows.length>0)
            {
            feesplit=rows;
            connection.query("SELECT sum(amount) as total FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and zone_name='"+zonename+"'",function(err, rows){
            if(!err)            
            res.status(200).json({'studinfo':studinfo,'total': rows[0].total,'zonename':zonename,'feesplit':feesplit});
            else
            console.log(err);
            });
            }
            else{
            connection.query("SELECT * FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and zone_name='"+zonename+"' and schedule_for='All'",function(err, rows){
            if(!err){
            if(rows.length>0){
            feesplit=rows;
            connection.query("SELECT sum(amount) as total FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and zone_name='"+zonename+"'",function(err, rows){
            if(!err)            
            res.status(200).json({'studinfo':studinfo,'total': rows[0].total,'zonename':zonename,'feesplit':feesplit});
            else
            console.log(err);
            });
            }
            else
            res.status(200).json({'returnval': 'no rows'});
            }
            else
            console.log(err);
            });
            }
            });
            } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } 
      else {
        console.log(err);
      }
    });
  }
  }
  else
    console.log(err);
  });
});


app.post('/searchtransportzonechangefeepaidinfo-service1',  urlencodedParser,function (req, res){
 var qur="SELECT * FROM transport.student_fee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"' and "+
 " status='mapped' and ((install1_status in('processing','paid','bounce','cancel')) or (install2_status in('processing','paid','bounce','cancel'))) ";
 var qur1="SELECT * FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and name='"+req.query.studentname+"'";
 console.log('---------------------------------------------------');
 console.log(qur);
 console.log('---------------------------------------------------');
 console.log(qur1);
 var paidarr=[];
 connection.query(qur,function(err, rows)
    {
      if(!err)
      {
        if(rows.length==0){
          res.status(200).json({'paidarr': "no rows",'paidcheque': "no rows"});
        }
        else{
          paidarr=rows;
          connection.query(qur1,function(err, rows){
          if(!err){
          res.status(200).json({'paidarr': paidarr,'paidcheque': rows});
          }
          });
        } 
      } 
      else
      {
        console.log(err);
      }
    });
});


app.post('/fetchtransportzonechangefees-service1',  urlencodedParser,function (req, res){
 
 var qur1="SELECT * from transport.zonechange_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
 console.log(qur1);
 var feesplit=[];
 var zonename="";
 var studinfo=[];
 connection.query("SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'",function(err, rows){
 if(!err){
 if(rows.length>0){
 studinfo=rows;
 connection.query(qur1,function(err, rows){
      if(!err){
        res.status(200).json({'studinfo':studinfo,'zoneinfo':rows});     
      }
      else
        console.log(err);
    });
  }
  }
  else
    console.log(err);
  });
});


app.post('/fetchreceiptseq-service',  urlencodedParser,function (req, res){
 var qur="SELECT transport_receipt_seq FROM receipt_sequence";
 console.log(qur);
 connection.query(qur,
    function(err, rows)
    {
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': ''});
        }
      } 
      else 
      {
        console.log(err);
      }
    });
});

app.post('/inserttransportfees-service',  urlencodedParser,function (req, res){
 var response1={
  installment_1: req.query.insamount,
  receipt_no1: req.query.insreceiptno,
  installment_1Date: req.query.insdate,
  modeofpayment1: req.query.inspaymentmode,
  install1_status: req.query.insstatus,
  install1_fine: req.query.insfineamount,
  discount_fee: req.query.discount,
  receipt_date1: req.query.receiptdate,
  paid_date1: req.query.paiddate,
  installment_pattern: req.query.pattern
 };
 var cheque1={
  school_id:req.query.schoolid,
  student_id:req.query.studentid,
  name:req.query.studentname,
  installtype:req.query.installment,
  cheque_no:req.query.inschequeno,
  bank_name:req.query.insbankname,
  cheque_date: req.query.inschequedate,
  cheque_status: req.query.inschequestatus,
  academic_year:req.query.academicyear,
  paid_date:req.query.paiddate
 };
 var response2={
  installment_2: req.query.insamount,
  receipt_no2: req.query.insreceiptno,
  installment_2Date: req.query.insdate,
  modeofpayment2: req.query.inspaymentmode,
  install2_status: req.query.insstatus,
  install2_fine: req.query.insfineamount,
  discount_fee: req.query.discount,
  receipt_date2: req.query.receiptdate,
  paid_date2: req.query.paiddate,
  installment_pattern: req.query.pattern
 };
  var cheque2={
  school_id:req.query.schoolid,
  student_id:req.query.studentid,
  name:req.query.studentname,
  installtype:req.query.installment,
  cheque_no:req.query.inschequeno,
  bank_name:req.query.insbankname,
  cheque_date: req.query.inschequedate,
  cheque_status: req.query.inschequestatus,
  academic_year:req.query.academicyear,
  paid_date:req.query.paiddate
 };

 console.log('-----------------------------');
 console.log(cheque1);
 console.log('-----------------------------');
 console.log(cheque2);
 console.log('-----------------------------');

 console.log(response1.receipt_no1+" "+response2.receipt_no2);
 if(req.query.installment=="Installment1"||req.query.installment=="Lumpsum"){
 var qur="update transport.student_fee SET ? WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"' and status='mapped'";
 console.log(qur);
 connection.query(qur,[response1],
    function(err, result)
    {
      if(!err){
        if(result.affectedRows>0){
          if(req.query.inspaymentmode=="Cheque"||req.query.inspaymentmode=="Transfer"||req.query.inspaymentmode=="Card Swipe")
          {
            connection.query("INSERT INTO transport.cheque_details SET ?",[cheque1],function(err, result){
              if(!err){
              if(result.affectedRows>0){
                res.status(200).json({'returnval': 'Updated!'});
              }
              else{
                console.log(err);
                res.status(200).json({'returnval': 'Not Updated!'});
              }
              }
              else
                console.log(err);
            });
          }
          else
          res.status(200).json({'returnval': 'Updated!'});
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!'});
        }
      } 
      else 
      {
        console.log(err);
      }
    });
}
if(req.query.installment=="Installment2"){
 var qur="update transport.student_fee SET ? WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"' and status='mapped'";
 console.log(qur);
 connection.query(qur,[response2],
    function(err, result)
    {
      if(!err){
        if(result.affectedRows>0){
          if(req.query.inspaymentmode=="Cheque"||req.query.inspaymentmode=="Transfer"||req.query.inspaymentmode=="Card Swipe")
          {
            connection.query("INSERT INTO transport.cheque_details SET ?",[cheque2],function(err, result){
              if(result.affectedRows>0){
                res.status(200).json({'returnval': 'Updated!'});
              }
              else{
                console.log(err);
                res.status(200).json({'returnval': 'Not Updated!'});
              }
            });
          }
          else
          res.status(200).json({'returnval': 'Updated!'});
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!'});
        }
      } 
      else 
      {
        console.log(err);
      }
    });
}
});


app.post('/updatingreceiptseq-service',  urlencodedParser,function (req, res){
 var qur="update receipt_sequence SET transport_receipt_seq='"+req.query.seqno+"'";
 console.log(qur);
 connection.query(qur,
    function(err, result)
    {
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Updated!'});
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!'});
        }
      } 
      else 
      {
        console.log(err);
      }
    });
});


app.post('/fetchstudentforreceiptsearch-service',  urlencodedParser,function (req, res){
 var qur="SELECT * FROM transport.student_fee f join md_admission d on(f.student_id=d.admission_no) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and (f.install1_status in ('processing','paid') or f.install2_status in ('processing','paid'))"+
 " and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"'";
 console.log(qur);
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
      } 
      else 
      {
        console.log(err);
      }
    });
});


app.post('/fetchreceiptinfo-service',  urlencodedParser,function (req, res){
 var qur="SELECT * FROM transport.student_fee f join md_admission a on(f.student_id=a.admission_no) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and f.student_id='"+req.query.studentid+"' and f.student_name='"+req.query.studentname+"' and a.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and a.admission_no='"+req.query.studentid+"' and a.student_name='"+req.query.studentname+"'";
 var qur1="SELECT * FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and name='"+req.query.studentname+"'";
 console.log(qur);
 var fees=[];
 connection.query(qur,function(err, rows){
      if(!err){
        if(rows.length>0){
          fees=rows;
          connection.query(qur1,function(err, rows){
          res.status(200).json({'fees': fees,'cheques':rows});
          });
        } 
        else {
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

app.post('/fetchstudentforprocessing-service',  urlencodedParser,function (req, res){
 var qur="SELECT * FROM transport.student_fee f join md_admission d on(f.student_id=d.admission_no) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and (f.install1_status in ('processing','paid') or f.install2_status in ('processing','paid')) and (f.modeofpayment1 in('Cheque','Card Swipe','Transfer') or f.modeofpayment2 in('Cheque','Card Swipe','Transfer'))"+
 " and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"' and f.academic_year='"+req.query.academicyear+"'";
 console.log(qur);
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
      } 
      else 
      {
        console.log(err);
      }
    });
});

app.post('/fetchtransportchequeforeditordelete-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM transport.cheque_details where school_id='"+req.query.schoolid+"' and (student_id like '%"+req.query.searchvalue+"%' or cheque_no like '%"+req.query.searchvalue+"%') and name='"+req.query.studentname+"' and academic_year='"+req.query.academicyear+"'";
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

app.post('/edittransportcheque-Service',  urlencodedParser,function (req, res){
  var qur="UPDATE transport.cheque_details SET cheque_no='"+req.query.chequeno+"',bank_name='"+req.query.bankname+"',cheque_date='"+req.query.chequedate+"' where school_id='"+req.query.schoolid+"' and student_id='"+req.query.admissionno+"' and installtype='"+req.query.installment+"' and name='"+req.query.studentname+"'";
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

app.post('/deletetransportcheque-Service',  urlencodedParser,function (req, res){
  var qur="DELETE FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and student_id='"+req.query.admissionno+"' and name='"+req.query.studentname+"' and cheque_no='"+req.query.chequeno+"' and installtype='"+req.query.installmenttype+"'";
  if(req.query.installmenttype=='Installment1')
  var qur1="UPDATE transport.student_fee set install1_status='Deleted' WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.admissionno+"' and student_name='"+req.query.studentname+"'";
  if(req.query.installmenttype=='Installment2')
  var qur1="UPDATE transport.student_fee set install2_status='Deleted' WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.admissionno+"' and student_name='"+req.query.studentname+"'";
  console.log('-------------------------------------------');
  console.log(qur);
  console.log(qur1);
  console.log('-------------------------------------------');
  connection.query(qur,function(err, result){
      if(!err){
        if(result.affectedRows>0){
        connection.query(qur1,function(err, result){
          if(!err){
          res.status(200).json({'returnval': 'Deleted!'});
          }
          else
          res.status(200).json({'returnval': 'Not Deleted!'}); 
        });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Deleted!'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/fetchtransportdaycollection-service',  urlencodedParser,function (req, res){
var qur1="SELECT * FROM transport.student_fee WHERE school_id='"+req.query.schoolid+"' and "+
" academic_year='"+req.query.academicyear+"' and  (((STR_TO_DATE(paid_date1,'%m/%d/%Y')>= "+
" STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(paid_date1,'%m/%d/%Y')<= "+
" STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and modeofpayment1='Cash' and school_id='"+req.query.schoolid+"') or "+
" ((STR_TO_DATE(paid_date1,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and "+
" (STR_TO_DATE(paid_date1,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and "+
" modeofpayment1 in ('Cheque','Card Swipe','Transfer') and install1_status "+
" in('processing','paid')) and school_id='"+req.query.schoolid+"') or (((STR_TO_DATE(paid_date2,'%m/%d/%Y')>= "+
" STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(paid_date2,'%m/%d/%Y')<= "+
" STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and modeofpayment2='Cash' and school_id='"+req.query.schoolid+"') or "+
" ((STR_TO_DATE(paid_date2,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and "+
" (STR_TO_DATE(paid_date2,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and "+
" modeofpayment2 in ('Cheque','Card Swipe','Transfer') and install2_status "+
" in('processing','paid')) and school_id='"+req.query.schoolid+"')";
if(req.query.type=="All")
var qur2="SELECT * FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
" (STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_status in('paid','processing','cleared')";
if(req.query.type!="All")
var qur2="SELECT * FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
" (STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and cheque_status in('paid','processing','cleared') and installtype='"+req.query.type+"'";

var feearr=[];
var chequearr=[];
console.log('-------------------------------');
console.log(qur1);
console.log('-------------------------------');
console.log(qur2);
var qur3="SELECT * FROM md_admission a join transport.student_fee f on(a.admission_no=f.student_id) "+
" WHERE a.school_id='"+req.query.schoolid+"' and f.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and f.academic_year='"+req.query.academicyear+"'";
connection.query(qur1,function(err, rows){
       if(!err){
         if(rows.length>0){
         feearr=rows;
         console.log(feearr.length);
         connection.query(qur2,function(err, rows){
         if(!err){
         chequearr=rows;
         connection.query(qur3,function(err, rows){
         if(!err){
         res.status(200).json({'feearr': feearr,'chequearr': chequearr,'studarr':rows});
         }
         });
         }
         else
          console.log(err);
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


app.post('/fetchtransportpdccollection-service',  urlencodedParser,function (req, res){
// var qur1="SELECT * FROM transport.student_fee WHERE school_id='"+req.query.schoolid+"' and "+
// " academic_year='"+req.query.academicyear+"' and  (((STR_TO_DATE(paid_date1,'%m/%d/%Y')>= "+
// " STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(paid_date1,'%m/%d/%Y')<= "+
// " STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and modeofpayment1='Cash' and school_id='"+req.query.schoolid+"') or "+
// " ((STR_TO_DATE(paid_date1,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and "+
// " (STR_TO_DATE(paid_date1,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and "+
// " modeofpayment1 in ('Cheque','Card Swipe','Transfer') and install1_status "+
// " in('processing','paid')) and school_id='"+req.query.schoolid+"') or (((STR_TO_DATE(paid_date2,'%m/%d/%Y')>= "+
// " STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(paid_date2,'%m/%d/%Y')<= "+
// " STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and modeofpayment2='Cash' and school_id='"+req.query.schoolid+"') or "+
// " ((STR_TO_DATE(paid_date2,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y')) and "+
// " (STR_TO_DATE(paid_date2,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) and "+
// " modeofpayment2 in ('Cheque','Card Swipe','Transfer') and install2_status "+
// " in('processing','paid')) and school_id='"+req.query.schoolid+"')";
// var qur2="SELECT * FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
// " (STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
// " and ((cheque_date in(select installment_date from mlzscrm.transport_fee_schedule where "+
// " installment='Installment2' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"')) or (STR_TO_DATE(cheque_date,'%m/%d/%Y')>STR_TO_DATE('"+req.query.currdate+"','%m/%d/%Y'))) and cheque_status in('processing')";
var qur2="SELECT * FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
" (STR_TO_DATE(cheque_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(cheque_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
" and ((cheque_date in(select installment_date from transport_fee_schedule where "+
" installment='Installment2' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"')) or (STR_TO_DATE(cheque_date,'%m/%d/%Y')>(select distinct(installment_date) from transport_fee_schedule where "+
" installment='Installment2' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and schedule_for='All'))) and "+
" cheque_status in('processing')";

var feearr=[];
var chequearr=[];
// console.log('-------------------------------');
// console.log(qur1);
console.log('-------------------------------');
console.log(qur2);
var qur3="SELECT * FROM md_admission a join transport.student_fee f on(a.admission_no=f.student_id) "+
" WHERE a.school_id='"+req.query.schoolid+"' and f.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and f.academic_year='"+req.query.academicyear+"'";
// connection.query(qur1,function(err, rows){
//        if(!err){
//          if(rows.length>0){
//          feearr=rows;
//          console.log(feearr.length);
         connection.query(qur2,function(err, rows){
         if(!err){
         chequearr=rows;
         connection.query(qur3,function(err, rows){
         if(!err){
         res.status(200).json({'chequearr': chequearr,'studarr':rows});
         }
         });
         }
         else
          console.log(err);
         });
     //     }else{
     //       console.log(err);
     //       res.status(200).json({'returnval':'no rows'});
     //     }
     //   }else{
     //     console.log(err);
     //   }
     // });
});


app.post('/fetchallstudentforzonechangecollection-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM transport.zonechange_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and mode='Payable'";
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

app.post('/fetchallstudentforzone-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and transport_availed='yes'";
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


app.post('/fetchstudentinfoforzoneallocation-service',  urlencodedParser,function (req, res){
  var qurr="SELECT * FROM transport.student_fee  f join transport.md_zone z on(f.zone_id=z.id) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and f.student_id='"+req.query.studentid+"' and f.student_name='"+req.query.studentname+"' and f.status='mapped' and z.school_id='"+req.query.schoolid+"' and z.academic_year='"+req.query.academicyear+"'";
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  console.log('------------------stud info for zone allocatezone-------------------------');
  console.log(qurr);
  console.log(qur);
  console.log('--------------------------------------------------------------------------');
  var feearr=[];
  var flag="";
  connection.query(qurr,function(err, rows){
  if(!err){
  if(rows.length>=0){
  feearr=rows;
  if(rows.length==0)
    flag="notmapped";
  if(rows.length>0)
    flag="mapped";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){

          res.status(200).json({'flag':flag,'feearr':feearr,'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
    }
  else
    res.status(200).json({'returnval': 'Already Mapped!!'});
  }
  });
});

app.post('/fetchstudentinfoforzonechangecollection-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM transport.zonechange_master m join md_admission a on(m.student_id=a.admission_no) WHERE "+
  "m.school_id='"+req.query.schoolid+"' and m.academic_year='"+req.query.academicyear+"' and m.student_id='"+req.query.studentid+"' and "+
  "a.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and a.admission_no='"+req.query.studentid+"'";  
  console.log('------------------stud info for zone change collection-------------------------');
  console.log(qur);
  console.log('--------------------------------------------------------------------------');
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } 
      else {
        console.log(err);
      }
    });
});

app.post('/fetchstudentinfoforzonechange-service',  urlencodedParser,function (req, res){
  var qurr="SELECT * FROM transport.student_fee  f join transport.md_zone z on(f.zone_id=z.id) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and f.student_id='"+req.query.studentid+"' and f.student_name='"+req.query.studentname+"' and f.status='mapped' and z.school_id='"+req.query.schoolid+"' and z.academic_year='"+req.query.academicyear+"' and status='mapped'";
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  console.log('------------------stud info for zone changezone-------------------------');
  console.log(qurr);
  console.log(qur);
  console.log('--------------------------------------------------------------------------');
  var feearr=[];
  var flag="";
  connection.query(qurr,function(err, rows){
  if(!err){
  if(rows.length>=0){
  feearr=rows;
  if(rows.length==0)
    flag="notmapped";
  if(rows.length>0)
    flag="mapped";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){

          res.status(200).json({'flag':flag,'feearr':feearr,'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
    }
  else
    res.status(200).json({'returnval': 'Already Mapped!!'});
  }
  });
});

app.post('/allocatezone-service',  urlencodedParser,function (req, res){
  // var qur="SELECT * FROM transport.student_fee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and status='mapped'";
  var queryy="insert into transport.student_fee values('"+req.query.schoolid+"','"+req.query.studentid+"',(select id from transport.md_zone where zone_name='"+req.query.zonename+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'),'','',0,0,'"+req.query.fees+"',0,'','','','',(SELECT distinct(start_date) FROM transport.transport_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'),(SELECT distinct(end_date) FROM transport.transport_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'),'Two-Way','"+req.query.updatedby+"',STR_TO_DATE('"+req.query.currdate+"','%Y/%m/%d'),'mapped','','',0,0,'"+req.query.academicyear+"','','','','','','0','0','','','"+req.query.studentname+"',(select admission_status from transport.student_details where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'))";
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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


app.post('/fetchtransportgrade-service',  urlencodedParser,function (req, res){
  var queryy="SELECT * FROM grade_master";
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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


app.post('/insertnewstudent-service',  urlencodedParser,function (req, res){
  var response={
    admission_no: req.query.enrollmentno,
    school_id: req.query.schoolid,
    academic_year: req.query.academicyear,
    first_name: req.query.firstname,
    middle_name: req.query.middlename,
    last_name: req.query.lastname,
    student_name: req.query.studentname,
    class_for_admission: req.query.grade,
    dob: req.query.dob,
    father_name: req.query.fathername,
    mother_name: req.query.mothername,
    transport_availed:'Yes',
    admission_status:'New'
  };
  var response1={
    first_name: req.query.firstname,
    middle_name: req.query.middlename,
    last_name: req.query.lastname,
    student_name: req.query.studentname,
    class_for_admission: req.query.grade,
    dob: req.query.dob,
    father_name: req.query.fathername,
    mother_name: req.query.mothername,
    transport_availed:'Yes',
    admission_status:'New'
  };
  var queryy="INSERT INTO md_admission SET ?";
  var checkqur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.enrollmentno+"'";
  console.log('-------------------------------------------');
  console.log(queryy);
    var queryy1="UPDATE md_admission SET ? WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.enrollmentno+"'";
  connection.query(checkqur,function(err, rows){
  if(rows.length==0){
  connection.query(queryy,[response],function(err, result){
      if(!err)
      {
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Inserted!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Inserted!!'});
        }
      }
      else
      {
        console.log(err);
      }
  });
  }
  else{
  connection.query(queryy1,[response1],function(err, result){
    if(!err)
      {
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Updated!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!!'});
        }
      }
      else
      {
        console.log(err);
      }
  });
  }
  });
});


app.post('/fetchalltransportstudent-service',  urlencodedParser,function (req, res){
  var queryy="SELECT distinct(f.student_id),c.name FROM transport.student_fee f join transport.cheque_details c on(f.student_id=c.student_id) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' "+
  " and c.school_id='"+req.query.schoolid+"' and c.academic_year='"+req.query.academicyear+"' and c.cheque_status not in('cancel','bounce') and f.install1_status not in('cancel','bounce') "+
  "and f.install2_status not in('cancel','bounce')";
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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

app.post('/processtransportbouncecheque-servicee',  urlencodedParser,function (req, res){
  console.log('---------------------'+req.query.id);
  var queryy="SELECT * FROM transport.student_fee f join transport.cheque_details c on(f.student_id=c.student_id) WHERE f.academic_year=c.academic_year and f.school_id=c.school_id and f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' "+
  " and c.school_id='"+req.query.schoolid+"' and c.academic_year='"+req.query.academicyear+"' and  (c.student_id='"+req.query.id+"' and  f.student_id='"+req.query.id+"' and c.name='"+req.query.studentname+"' and f.student_name='"+req.query.studentname+"') or (c.cheque_no='"+req.query.id+"') and c.cheque_status not in('cancel','bounce') and f.install1_status not in('cancel','bounce') "+
  "and f.install2_status not in('cancel','bounce')";
  console.log('-------------------------------------------');
  console.log(queryy);  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } 
        else{
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


app.post('/updatetransportchequestatus-service',urlencodedParser,function (req, res){
  var waiveoff=0;
  if(req.query.waiveoff==0)
    waiveoff=250;
  if(req.query.waiveoff==1)
    waiveoff=0;
  var queryy1="UPDATE transport.cheque_details SET cheque_status='"+req.query.chequestatus+"',cancel_date='"+req.query.canceldate+"' WHERE school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"' and installtype='"+req.query.installmenttype+"' and student_id='"+req.query.studentid+"' and name='"+req.query.studentname+"'";
  if(req.query.installmenttype=="Installment1")
  var queryy2="UPDATE  transport.student_fee SET install1_status='"+req.query.chequestatus+"',install1_fine='"+waiveoff+"' WHERE school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  if(req.query.installmenttype=="Installment2")
  var queryy2="UPDATE  transport.student_fee SET install2_status='"+req.query.chequestatus+"',install2_fine='"+waiveoff+"' WHERE school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
 
  console.log('-------------------------------------------');
  console.log(queryy1); 
  console.log('-------------------------------------------');
  console.log(queryy2);  
  connection.query(queryy1,function(err, result){
      if(!err)
      {
        if(result.affectedRows>0){
          connection.query(queryy2,function(err, result){
          if(!err)
          res.status(200).json({'returnval': 'Updated!'});
          else
          {
            console.log(err);
            res.status(200).json({'returnval': 'Not Updated!'});
          }
          });
        } 
        else{
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!!'});
        }
      }
      else
      {
        console.log(err);
      }
  });
});

app.post('/fetchstudentforcancellation-service',  urlencodedParser,function (req, res){
  var queryy="SELECT a.admission_no,a.student_name FROM transport.student_fee f join md_admission a on(f.student_id=a.admission_no) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' "+
  " and a.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"'"+
  "";
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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

app.post('/fetchstudinfoforcancellation-service',  urlencodedParser,function (req, res){
  var queryy="SELECT a.admission_no,a.student_name,z.zone_name,a.class_for_admission,a.father_name FROM transport.student_fee f join md_admission a on(f.student_id=a.admission_no) join transport.md_zone z on(f.zone_id=z.id) WHERE z.school_id='"+req.query.schoolid+"' and z.academic_year='"+req.query.academicyear+"' and f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' "+
  " and a.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and f.student_id='"+req.query.studentid+"' and f.student_name='"+req.query.studentname+"' and a.student_name='"+req.query.studentname+"'";
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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

app.post('/cancelzone-service',  urlencodedParser,function (req, res){
  var queryy1="DELETE FROM transport.student_fee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'"+
  " and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  var queryy2="DELETE FROM transport.cheque_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'"+
  " and student_id='"+req.query.studentid+"' and name='"+req.query.studentname+"'";
  console.log('-------------------------------------------');
  console.log(queryy1);
  console.log(queryy2);
  
  connection.query(queryy1,function(err, rows){
      if(!err)
      {
      connection.query(queryy2,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': 'Updated!'});
      }
      else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!'});
        }
      });
      }
      else
      console.log(err);
  });
});

app.post('/fetchstudentfordiscount-service',  urlencodedParser,function (req, res){
  // var queryy="SELECT * from mlzscrm.md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  var queryy="SELECT a.admission_no,a.student_name FROM transport.student_fee f join md_admission a on(f.student_id=a.admission_no) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' "+
  " and a.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"'"+
  "";
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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

app.post('/fetchstudinfofordiscount-service',  urlencodedParser,function (req, res){
  // var queryy="SELECT * FROM mlzscrm.md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.studentid+"'";
  var queryy="SELECT a.admission_no,a.student_name,z.zone_name,a.class_for_admission,a.father_name,f.fees FROM transport.student_fee f join md_admission a on(f.student_id=a.admission_no) join transport.md_zone z on(f.zone_id=z.id) WHERE z.school_id='"+req.query.schoolid+"' and z.academic_year='"+req.query.academicyear+"' and f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' "+
  " and a.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and f.student_id='"+req.query.studentid+"' and f.student_name='"+req.query.studentname+"' and a.student_name='"+req.query.studentname+"'";

  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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

app.post('/attachtransportdiscount-service',  urlencodedParser,function (req, res){
  if(req.query.installment=="Installment1")
  var queryy="UPDATE transport.student_fee SET install1_discount='"+req.query.amount+"',install1_discount_comment='"+req.query.reason+"' WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  if(req.query.installment=="Installment2")
  var queryy="UPDATE transport.student_fee SET install2_discount='"+req.query.amount+"',install2_discount_comment='"+req.query.reason+"' WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, result){
      if(!err)
      {
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Updated!!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!!'});
        }
      }
      else
      {
        console.log(err);
      }
  });
});


app.post('/transportdailycollection-service',  urlencodedParser,function (req, res){
  
  var totqur="select school_id,(select name from transport.md_school where id=school_id) as schoolname ,admission_status ,count(*) as totcnt,sum(installment_1+installment_2) as tottotal from transport.student_fee where admission_status in('New','Promoted') and academic_year='"+req.query.academicyear+"' and paid_date1 is not null group by school_id,admission_status";
  var todayqur="select school_id,(select name from transport.md_school where id=school_id) as schoolname ,admission_status,count(*) as todaycnt,sum(installment_1+installment_2) as todaytotal from transport.student_fee where admission_status in('New','Promoted') and academic_year='"+req.query.academicyear+"' and paid_date1 is not null and STR_TO_DATE(paid_date1,'%m/%d/%Y')=STR_TO_DATE('"+req.query.currdate+"','%m/%d/%Y') group by school_id,admission_status";
  // var totcollqur="select (select name from transport.md_school where id=school_id) ,admission_status,sum(installment_1+installment_2) as total from transport.student_fee where admission_status in('New','Promoted') and academic_year='"+req.query.academicyear+"' and paid_date1 is not null group by school_id,admission_status";
  // var todaycollqur="select (select name from transport.md_school where id=school_id) ,admission_status,sum(installment_1+installment_2) as total from transport.student_fee where admission_status in('New','Promoted') and academic_year='"+req.query.academicyear+"' and paid_date1 is not null and paid_date1='"+req.query.currdate+"' group by school_id,admission_status";

  console.log('-------------------------------------------');
  console.log(totqur);
  console.log(todayqur);
  var total=[];
  var today=[];
  connection.query(totqur,function(err, rows){
      if(!err)
      {
        total=rows;
      connection.query(todayqur,function(err, rows){
      if(!err)
      {
        today=rows;
        res.status(200).json({'total': total,'today': today});
      }
      else
      console.log(err); 
      });
      }
      else
      {
        console.log(err);
      }
  });
});

app.post('/savezonechange-service',  urlencodedParser,function (req, res){
  var queryy="INSERT INTO transport.zonechange_master SET ?";
  var response={
    school_id: req.query.schoolid,
    student_id: req.query.studentid,
    student_name: req.query.studentname,
    zone_id: req.query.zoneid,
    zone_name: req.query.zonename,
    fees: req.query.amount
  };
  // var queryy1="insert into transport.student_fee values('"+req.query.schoolid+"','"+req.query.studentid+"',(select id from transport.md_zone where zone_name='"+req.query.zonename+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'),'','',0,0,'"+req.query.fees+"',0,'','','','',(SELECT distinct(start_date) FROM transport.transport_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'),(SELECT distinct(end_date) FROM transport.transport_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'),'Two-Way','"+req.query.updatedby+"',STR_TO_DATE('"+req.query.currdate+"','%Y/%m/%d'),'mapped','','',0,0,'"+req.query.academicyear+"','','','','','','0','0','','','"+req.query.studentname+"',(select admission_status from transport.student_details where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'))";
  var qur="DELETE FROM transport.student_point where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  console.log('-------------------------------------------');
  console.log(queryy);
  console.log(qur);
  
  connection.query("UPDATE transport.student_fee SET status='changed' WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'",function(err, result){
  if(result.affectedRows>0){
  connection.query("INSERT INTO transport.zonechange_master(school_id,academic_year,student_id,student_name,zone_id,zone_name,fees,mode) VALUES('"+req.query.schoolid+"','"+req.query.academicyear+"','"+req.query.studentid+"','"+req.query.studentname+"',(SELECT id FROM transport.md_zone WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and distance_id='"+req.query.zoneid+"'),'"+req.query.zonename+"','"+req.query.amount+"','"+req.query.mode+"')",function(err, result){
      if(!err)
      {
        if(result.affectedRows>0){
          connection.query(qur,function(err, result){
          res.status(200).json({'returnval': 'Updated!!'});
          });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!!'});
        }
      }
      else
      {
        console.log(err);
      }
  });
  }
  else
    console.log(err);
  });
});


app.post('/transportcancellation-service',  urlencodedParser,function (req, res){
  
  var queryy="update transport.student_fee set status='cancelled' where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'"
  var qur="DELETE FROM transport.student_point where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  console.log('-------------------------------------------');
  console.log(queryy);
  console.log(qur);
  
  connection.query(queryy,function(err, result){
      if(!err)
      {
        if(result.affectedRows>0){
          connection.query(qur,function(err, result){
          res.status(200).json({'returnval': 'Updated!!'});
          });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!!'});
        }
      }
      else
      {
        console.log(err);
      }
  });

});

app.post('/fetchtransportpendingfee-service',  urlencodedParser,function (req, res){
  if(req.query.grade=="All Grades"){  
  if(req.query.type=="All")
  var qur1="select * from transport.student_fee f join transport.student_details d on(f.student_id=d.id) where f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"' ";
  else
  var qur1="select * from transport.student_fee f join transport.student_details d on(f.student_id=d.id) where f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"' and d.admission_status='"+req.query.type+"' and f.admission_status='"+req.query.type+"'";
  }
  else
  {
  if(req.query.type=="All")
  var qur1="select * from transport.student_fee f join transport.student_details d on(f.student_id=d.id) where f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"' and d.class='"+req.query.grade+"'";
  else
  var qur1="select * from transport.student_fee f join transport.student_details d on(f.student_id=d.id) where f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"' and d.class='"+req.query.grade+"' and d.admission_status='"+req.query.type+"' and f.admission_status='"+req.query.type+"'";
  }
  var qur2="SELECT * FROM transport.student_fee WHERE status in('changed')";
  console.log('-------------------------------------------');
  console.log(qur1);
  var arr=[];
  connection.query(qur1,function(err, rows){
      if(!err)
      {
        arr=rows;
        connection.query(qur2,function(err, rows){
        res.status(200).json({'returnval': arr,'change':rows});
        });
      } 
      else 
      {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
      }
  });
});


app.post('/fetchbouncecollection-service',  urlencodedParser,function (req, res){
  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_no=f.admission_no) as activestatus FROM md_student_paidfee f WHERE cheque_status='bounced' and school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"'";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});


app.post('/fetchtccollection-service',  urlencodedParser,function (req, res){
  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND (admission_no=f.admission_no or enquiry_no=f.admission_no)) as activestatus FROM md_student_paidfee f WHERE paid_status='cancelled' and cheque_status='cancelled' and school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"'";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});


app.post('/fetchwithdrawcollection-service',  urlencodedParser,function (req, res){
  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND (admission_no=f.admission_no or enquiry_no=f.admission_no)) as activestatus FROM md_student_paidfee f WHERE paid_status='withdrawn' and cheque_status='withdrawn' and school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"'";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});


app.post('/fetchapplncollection-service',  urlencodedParser,function (req, res){
  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND enquiry_no=f.admission_no) as activestatus FROM md_student_paidfee f WHERE installment='Application Fee' and school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"'";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/fetchregfeecollection-service',  urlencodedParser,function (req, res){  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_no=f.admission_no) as activestatus FROM md_student_paidfee f WHERE installment='Registration Fee' and school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"'";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/fetchschoolfeecollection-service',  urlencodedParser,function (req, res){  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_no=f.admission_no) as activestatus FROM md_student_paidfee f WHERE paymenttype_flag!='2' and paid_status not in('bounced','cancelled','withdrawn') and cheque_status not in('bounced','cancelled','withdrawn') and installment not in('Application fee','Registration fee','Caution deposit') and school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"'";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/fetchlatefeecollection-service',  urlencodedParser,function (req, res){  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_no=f.admission_no) as activestatus FROM md_student_paidfee f WHERE latefee_amount!='0' and school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"'";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/fetchadhocfeecollection-service',  urlencodedParser,function (req, res){  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_no=f.admission_no) as activestatus FROM md_student_paidfee f WHERE adhoc_discount!=0 and school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"'";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});


app.post('/fetchtppendingcollection-service',  urlencodedParser,function (req, res){  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_no=f.admission_no) as activestatus FROM md_student_paidfee f WHERE payment_through='thirdparty' and school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"'";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/fetchrefundcollection-service',  urlencodedParser,function (req, res){  
  var qur="SELECT *,(SELECT active_status FROM md_admission WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND admission_no=f.admission_no) as activestatus FROM md_withdrawal f WHERE school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"' and returned_amount>0";
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/fetchcollectionrecondcinfo-service',  urlencodedParser,function (req, res){    
  var bouncequr="select sum(installment_amount) as amount,count(distinct(admission_no)) as actualcount,count(admission_no) as totalcount from "+
  " md_student_paidfee where cheque_status='bounced' and paymenttype_flag!='2'";
  var cancelqur="select sum(installment_amount) as amount,count(distinct(admission_no)) as actualcount,count(admission_no) as totalcount from "+
  " md_student_paidfee where paymenttype_flag!='2' and cheque_status='cancelled' and paid_status='cancelled'";
  var withdrawnqur="select sum(installment_amount) as amount,count(distinct(admission_no)) as actualcount,count(admission_no) as totalcount from "+
  " md_student_paidfee where paymenttype_flag!='2' and cheque_status='withdrawn' and paid_status='withdrawn'";
  var applnfeequr="select sum(installment_amount) as amount,count(distinct(admission_no)) as actualcount,count(admission_no) as totalcount from "+
  " md_student_paidfee where paymenttype_flag!='2' and installment in('Application fee') and paid_status not in('withdrawn')";
  var regfeequr="select sum(installment_amount) as amount,count(distinct(admission_no)) as actualcount,count(admission_no) as totalcount from "+
  " md_student_paidfee where paymenttype_flag!='2' and installment in('registration fee') and paid_status not in('withdrawn')";
  var schoolfeequr="select sum(installment_amount)+sum(fine_amount) as amount,count(distinct(admission_no)) as actualcount,count(admission_no) as totalcount "+
  " from md_student_paidfee where paymenttype_flag!='2' and installment not in('registration fee','application fee') "+
  " and paid_status not in('withdrawn','cancelled','bounced')and cheque_status not in('withdrawn', "+
  " 'cancelled','bounced')";
  var dcqur="select sum(installment_amount)+sum(fine_amount) as amount,count(distinct(admission_no)) as actualcount,count(admission_no) as totalcount from "+
  " md_student_paidfee where paymenttype_flag!='2' and cheque_status!='bounced'";
  var finequr="select sum(fine_amount) as amount,count(distinct(admission_no)) as actualcount,count(admission_no) as totalcount from "+
  " md_student_paidfee where paymenttype_flag!='2' and cheque_status!='bounced'";
  var tppendingqur="select sum(difference_amount) as amount from md_student_paidfee where paymenttype_flag!='2' and paid_status not in('cancelled','withdrawn')";
  console.log('---------------------------------');
  console.log(bouncequr);
  console.log('---------------------------------');
  console.log(cancelqur);
  console.log('---------------------------------');
  console.log(withdrawnqur);
  console.log('---------------------------------');
  console.log(applnfeequr);
  console.log('---------------------------------');
  console.log(regfeequr);
  console.log('---------------------------------');
  console.log(schoolfeequr);
  console.log('---------------------------------');
  console.log(dcqur);
  var arr=[];
  connection.query(bouncequr,function(err, rows){
      if(!err)
      {
        rows[0].category="Bounced";
        arr.push(rows[0]);
      connection.query(cancelqur,function(err, rows){
      if(!err)
      {
        rows[0].category="TC";
        arr.push(rows[0]);
      connection.query(withdrawnqur,function(err, rows){
      if(!err)
      {
        rows[0].category="Withdrawn";
        arr.push(rows[0]);
        connection.query(applnfeequr,function(err, rows){
        if(!err)
        {
          rows[0].category="Application Fee";
          arr.push(rows[0]);
          connection.query(regfeequr,function(err, rows){
          if(!err)
          {
            rows[0].category="Registration Fee";
            arr.push(rows[0]);
            connection.query(schoolfeequr,function(err, rows){
            if(!err)
            {
              rows[0].category="School Fee";
              arr.push(rows[0]);
              connection.query(dcqur,function(err, rows){
              if(!err)
              {
              rows[0].category="Total";
              arr.push(rows[0]);
              connection.query(finequr,function(err, rows){
              if(!err)
              {
              rows[0].category="Fine Amount";
              arr.push(rows[0]);
              connection.query(tppendingqur,function(err, rows){
              if(!err)
              {
              rows[0].category="TP Pending Amount";
              arr.push(rows[0]);
              res.status(200).json({'returnval': arr});
              }
              });
              }
              });
              }
              });
            }
            });
          }
          });
        }
        });
      }
      });
      }
      });
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});


 app.post('/admissiondashboard-service',  urlencodedParser,function (req, res){
  // var qur1="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and created_on=sysdate() group by class_for_admission";
  var qur1="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status not in('Default','Discontinued') and admission_status='New' group by class_for_admission";
  var qur2="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Withdrawn') and admission_status='New' and discount_type not in('3') group by class_for_admission";
  var qur3="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and admission_status='New' and discount_type not in('3') group by class_for_admission";
  var qur4="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Withdrawn') and admission_status='New' and discount_type in('3') group by class_for_admission";
  var qur5="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and admission_status='New' and discount_type in('3') group by class_for_admission";
  var qur6="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and admission_status='New' group by class_for_admission";
  console.log(qur1);
  console.log(qur2);
  console.log(qur3);
  console.log(qur4);
  console.log(qur5);
  console.log(qur6);
  var totalnewadmn=[];
  var newadmnwith=[];
  var newadmn=[];
  var rtenewwith=[];
  var rteadmn=[];
  var actualnewadmn=[];
  connection.query(qur1,function(err, rows){
      if(!err){
      totalnewadmn=rows;
      connection.query(qur2,function(err, rows){
      if(!err){
        newadmnwith=rows;
      connection.query(qur3,function(err, rows){
      if(!err){
        newadmn=rows;
      connection.query(qur4,function(err, rows){
      if(!err){
        rtenewwith=rows;
        connection.query(qur5,function(err, rows){
        if(!err){
        rteadmn=rows;
        connection.query(qur6,function(err, rows){
        if(!err){
        actualnewadmn=rows;
        res.status(200).json({'totalnewadmn':totalnewadmn,'newadmnwith':newadmnwith,'newadmn':newadmn,'rtenewwith':rtenewwith,'rteadmn':rteadmn,'actualnewadmn':actualnewadmn}); 
        }
        });
        }
        });
      }
      });
      }
      });
      }
      });
      } 
      else {
        console.log(err);
      }
  });
});

app.post('/admissiondashboard-service1',  urlencodedParser,function (req, res){
  var qur1="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_status='Promoted' and active_status not in('Discontinued','Default') group by class_for_admission";
  var qur2="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('cancelled') and admission_status='Promoted' and discount_type!='3' group by class_for_admission";
  var qur3="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and admission_status='Promoted' and discount_type!='3' group by class_for_admission";
  var qur4="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('cancelled') and discount_type='3' and admission_status='Promoted' group by class_for_admission";
  var qur5="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and discount_type='3' and admission_status='Promoted' group by class_for_admission";
  var qur6="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and admission_status='Promoted' group by class_for_admission";
  var qur7="SELECT class_for_admission as grade,count(admission_no) as total FROM md_admission where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and active_status in('Admitted') and admission_status in('New','Promoted') group by class_for_admission";
  var qur8="SELECT distinct(class_for_admission) as grade FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' order by class_for_admission";
  console.log(qur1);
  console.log(qur2);
  console.log(qur3);
  console.log(qur4);
  console.log(qur5);
  console.log(qur6);
  console.log(qur7);
  console.log(qur8);
  var totrollover=[];
  var rollover=[];
  var rollovertc=[];
  var rte=[];
  var rtetc=[];
  var rolloverstrength=[];
  var totstrength=[];
  var grade=[];
  connection.query(qur1,function(err, rows){
      if(!err){
      totrollover=rows;
      connection.query(qur2,function(err, rows){
      if(!err){
      rollovertc=rows;
      connection.query(qur3,function(err, rows){
      if(!err){
      rollover=rows;
      connection.query(qur4,function(err, rows){
      if(!err){
        rtetc=rows;
        connection.query(qur5,function(err, rows){
        if(!err){
        rte=rows;
        connection.query(qur6,function(err, rows){
        if(!err){
        rolloverstrength=rows;
        connection.query(qur7,function(err, rows){
        if(!err){
        totstrength=rows;
        connection.query(qur8,function(err, rows){
        if(!err){
        grade=rows;
        res.status(200).json({'totrollover':totrollover,'rollovertc':rollovertc,'rollover':rollover,'rtetc':rtetc,'rte':rte,'rolloverstrength':rolloverstrength,'totstrength':totstrength,'grade':grade}); 
        }
        });
        }
        });
        }
        });
        }
        });
      }
      });
      }
      });
      }
      });
      } 
      else {
        console.log(err);
      }
  });
});

app.post('/collection-fetchallstudent-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and active_status not in ('Cancelled') and academic_year='"+req.query.academicyear+"'";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-fetchallstudentforapplnfeecollection-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"'";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-studentinfo-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_admission a join md_student s on (a.admission_no=s.admission_no) WHERE a.school_id='"+req.query.schoolid+"' and s.school_id='"+req.query.schoolid+"' and a.admission_no='"+req.query.admissionno+"' and s.admission_no='"+req.query.admissionno+"' and a.active_status not in ('Cancelled')";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-fetchstudentinfoforapplnfeecollection-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and enquiry_no='"+req.query.enquiryno+"'";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-feeinfo-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_admission a join grade_master m on (a.class_for_admission=m.grade_name) WHERE a.school_id='"+req.query.schoolid+"' and a.admission_no='"+req.query.admissionno+"' and a.active_status not in ('Cancelled')";
  var feecodequr="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' and academic_year=? and admission_year=? and grade_id=?"
  var feequr="SELECT * FROM fee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code=?";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  console.log("-------------------------------------------");
  console.log(feecodequr);
  console.log("-------------------------------------------");
  console.log(feequr);
  var fee_code="";
  var total_fee="";
  var academicyear="";
  var admissionyear="";
  var grade="";
  connection.query(qur,function(err, rows){
      if(!err)
      {
        if(rows.length>0){ 
           academicyear=rows[0].academic_year;
           admissionyear=rows[0].admission_year;
           grade=rows[0].grade_id;         
           connection.query(feecodequr,[academicyear,admissionyear,grade],function(err, rows){
           if(!err)
           {
           if(rows.length>0){
           fee_code=rows[0].fee_code;
           total_fee=rows[0].fees;
           connection.query(feequr,[fee_code],function(err, rows){
           if(!err)
           {
           if(rows.length>0){
            res.status(200).json({'returnval': rows,'feecode':fee_code,'totalfee':total_fee,'gradeid':grade});
           }
           else
            res.status(200).json({'returnval': 'no feesplit!'});
           }
           else
           {
           console.log(err);
           res.status(200).json({'returnval': 'no rows'});
           }
           });
           }
           else{
            res.status(200).json({'returnval': 'no feecode!'});
           }
           }
           else
           {
           console.log(err);
           res.status(200).json({'returnval': 'no rows'});
           }
           });
        }
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-discountinfo-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_student_discount WHERE school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and academic_year='"+req.query.academicyear+"'";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-paymentinfo-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' ";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-receiptinfo-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' and admission_no='"+req.query.admissionno+"' and academic_year='"+req.query.academicyear+"'";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-fetchdiscounttypes-service',  urlencodedParser,function (req, res){  
   var qur="SELECT * FROM md_discount_type WHERE discount_type_id not in('4')";
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

app.post('/collection-fetchfeetypes-service',  urlencodedParser,function (req, res){  
   var qur="SELECT * FROM md_fee_type";
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

app.post('/collection-fetchdiscountavailability-service',  urlencodedParser,function (req, res){  
   var qur="SELECT * FROM md_discount_master WHERE school_id='"+req.query.schoolid+"' and "+
   " academic_year='"+req.query.academicyear+"' and admission_year='"+req.query.admissionyear+"' and "+
   " grade='"+req.query.gradeid+"' and discount_type_code='"+req.query.discounttypeid+"' and "+
   " STR_TO_DATE(from_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.currdate+"','%m/%d/%Y') and STR_TO_DATE(to_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.currdate+"','%m/%d/%Y')";
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

app.post('/collection-attachdiscount-service',  urlencodedParser,function (req, res){  
  var response={
    school_id:req.query.schoolid,
    academic_year:req.query.academicyear,
    admission_no:req.query.admissionno,
    student_name:req.query.studentname,
    grade:req.query.gradename,
    discount_type:req.query.discounttype,
    discount_amount:req.query.discountamount,
    reason:req.query.reason,
    avail_flag:'Not Yet',
    created_by:req.query.createdby,
    discount_feetype:req.query.feetype,
    common_feetype:req.query.commonfeetype
  };
  var checkqur="SELECT * FROM md_student_discount WHERE school_id='"+req.query.schoolid+"' AND "+
  " academic_year='"+req.query.academicyear+"' AND admission_no='"+req.query.admissionno+"' AND "+
  " grade='"+req.query.gradename+"' AND discount_type='"+req.query.discounttype+"'";
  var qur="INSERT INTO md_student_discount SET ?";
  console.log(checkqur);
  console.log(qur);
  connection.query(checkqur,function(err, rows){
  if(!err){
  if(rows.length==0){
  connection.query(qur,[response],function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Updated'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to update'});
        }
      } else {
        console.log(err);
      }
    });
  }
  else{
    res.status(200).json({'returnval': 'exist'});
  }
  }
  });
});

app.post('/collection-fetchfeecollectionpaymentinfo-service',  urlencodedParser,function (req, res){  
  var qur1="SELECT * FROM fee_master WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and admission_year='"+req.query.admissionyear+"' and grade_id=(select grade_id from grade_master where grade_name in('"+req.query.gradename+"'))";
  if(req.query.academicyear=='AY-2017-2018')
  var qur2="SELECT sum(discount_amount) as discount_amount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and admission_no='"+req.query.admissionno+"'";
  else
  var qur2="SELECT sum(discount_amount) as discount_amount FROM md_student_discount WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and admission_no='"+req.query.admissionno+"'";
  var qur3="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and admission_no='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress')";
  var qur4="SELECT sum(fine_amount) as fine_amount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and admission_no='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('bounced')";
 console.log(qur1);
  console.log(qur2);
  console.log(qur3);
  console.log(qur4);
  var total="0";
  var discount="0";
  var fineamount="0";
  var paidamount="0";
  var dueamount="0";
  connection.query(qur1,function(err, rows){
      if(!err){
      if(rows.length>0){
      total=rows[0].fees;
      if(total==null||total=="")
      total=0; 
      }
      connection.query(qur2,function(err, rows){if(!err){ 
      if(rows.length>0){
      discount=rows[0].discount_amount; 
      if(discount==null||discount=="")
      discount=0; 
      }
      connection.query(qur3,function(err, rows){if(!err){
        if(rows.length>0) {
        paidamount=rows[0].installment_amount;        
        if(paidamount==null||paidamount=="")
        paidamount=0; 
        }
        connection.query(qur4,function(err, rows){if(!err){
        if(rows.length>0) {
        fineamount=rows[0].fine_amount;        
        if(fineamount==null||fineamount=="")
        fineamount=0; 
        }
        dueamount=(parseFloat(total)+parseFloat(fineamount))-(parseFloat(paidamount)+parseFloat(discount));
        res.status(200).json({'total':total,'fineamount':fineamount,'discount':discount,'paidamount':paidamount,'dueamount':dueamount});     
      }
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
      else {
        console.log(err);
      }
    });
});

app.post('/collection-fetchcollectionfeetypetocollect-service',  urlencodedParser,function (req, res){  
  // var qur="SELECT distinct(fee_type) as fee_type,type FROM transport_fee_schedule WHERE "+
  // " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  var qur="SELECT distinct(common_feetype),type FROM md_fee_type WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and flag not in('2')";
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

app.post('/collection-fetchcollectionpaymenttype-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_payment_type";
  var paidqur="SELECT * FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared')";
  console.log(qur);
  console.log(paidqur);
  var paymenttype=[];
  connection.query(qur,function(err, rows){
      if(!err){
        if(rows.length>0){
          paymenttype=rows;
          connection.query(paidqur,function(err, rows){
          if(!err){
          res.status(200).json({'returnval': paymenttype,'paidins': rows});
          }
          });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/collection-fetchcollectionpaymentmode-service',  urlencodedParser,function (req, res){  
   var qur="SELECT distinct(payment_modeid),payment_modename,receive_flag,realise_flag FROM md_payment_mode";
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

app.post('/collection-fetchcollectionpaymentsubmode-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_payment_mode WHERE payment_modeid='"+req.query.modeid+"'";
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

app.post('/collection-fetchfeenetrycollectionfeetypeamount-service',  urlencodedParser,function (req, res){  
  var paidqur="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount,sum(fine_amount) as fine_amount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and admission_no='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress') "+
  " and installment_feetype='"+req.query.feetype+"'";
  var discountqur="SELECT sum(discount_amount) as discount_amount FROM md_student_discount WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and admission_no='"+req.query.admissionno+"' and common_feetype='"+req.query.feetype+"' ";
  var feequr="SELECT sum(total_fee) as fee_amount FROM fee_splitup WHERE school_id='"+req.query.schoolid+"' and fee_code='"+req.query.feecode+"' "+
  " and common_feetype='"+req.query.feetype+"'";
  var bouncequr="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount,sum(fine_amount) as fine_amount FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and admission_no='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('bounced') "+
  " and installment_feetype='"+req.query.feetype+"'";

  console.log('---------------fee type amount fetch------------------');
  console.log(paidqur);
  console.log(discountqur);
  console.log(feequr);
  var feeamount=0;
  var paidamount=0;
  var discountamount=0;
  var dueamount=0;
  var fineamount=0;
  var bouncefine=0;
  connection.query(feequr,function(err, rows){
      if(!err){
        if(rows.length>0){
          if(rows[0].fee_amount==null||rows[0].fee_amount=="")
          feeamount=0;
          else
          feeamount=rows[0].fee_amount;
          connection.query(paidqur,function(err, rows){
          if(!err){
          if(rows.length>0){
          if(rows[0].installment_amount==null||rows[0].installment_amount=="")
          paidamount=0;
          else
          paidamount=rows[0].installment_amount;
          if(rows[0].fine_amount==null||rows[0].fine_amount=="")
          fineamount=0;
          else
          fineamount=rows[0].fine_amount;
          }
          connection.query(discountqur,function(err, rows){
          if(!err){
          if(rows[0].discount_amount==null||rows[0].discount_amount=="")
          discountamount=0;
          else
          discountamount=rows[0].discount_amount;
        connection.query(bouncequr,function(err, rows){
          if(!err){
          if(rows[0].fine_amount==null||rows[0].fine_amount=="")
          bouncefine=0;
          else
          bouncefine=rows[0].fine_amount;
          dueamount=(parseInt(feeamount)+parseInt(fineamount)+parseInt(bouncefine))-(parseInt(paidamount)+parseInt(discountamount));
          res.status(200).json({'dueamount':dueamount});
        }
        });
          }
          });
          }
          });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
  });
});

app.post('/collection-fetchcollectionpaymenthistory-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' AND admission_no='"+req.query.admissionno+"' AND academic_year='"+req.query.academicyear+"'";
  console.log('--------------collection history--------------');
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

app.post('/collection-fetchcollectionpaymenthistory-service1',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' AND admission_no='"+req.query.admissionno+"' AND academic_year='"+req.query.academicyear+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress')";
  console.log('--------------collection history--------------');
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

app.post('/collection-makepayment-service',  urlencodedParser,function (req, res){  
  var seqqur="SELECT * FROM sequence WHERE school_id='"+req.query.schoolid+"'";
  var insertqur="INSERT INTO md_student_paidfee SET ?";
  console.log(seqqur);
  console.log(insertqur);
  var response={
    school_id:req.query.schoolid,   
    academic_year:req.query.academicyear,
    admission_year:req.query.admissionyear,
    admission_no:req.query.admissionno,
    student_name:req.query.studentname,
    grade:req.query.gradename,
    fee_code:req.query.feecode,
    installment:req.query.paymentfeetype,
    installment_type:req.query.paymentfeetype,
    mode_of_payment:req.query.paymentmodename,
    cheque_no:req.query.transactionno,
    bank_name:req.query.transactionname,
    actual_amount:req.query.amount,
    installment_amount:req.query.amount,
    received_date:req.query.dateofpayment,
    paid_status:'',
    paid_date:req.query.paiddate,
    receipt_no:'',
    receipt_date:req.query.paiddate,
    created_by:req.query.createdby,
    installment_date:req.query.transactiondate,
    fine_amount:'0',
    cheque_status:'',
    cheque_date:req.query.transactiondate,
    difference_amount:req.query.dueamount,
    payment_pattern:req.query.paymenttype,
    installment_pattern:req.query.typeid,
    admission_status:req.query.admissionstatus,
    transaction_no:'',
    pdc_flag:req.query.pdcflag,
    installment_feetype:req.query.paymentfeetype,
    receipt_type:''
  };
  // console.log(response);
  var receipttype="";
  connection.query(seqqur,function(err, rows){
      if(!err){
        if(rows.length>0){
          response.transaction_no=rows[0].transaction_no;
          var newtransno=parseInt(rows[0].transaction_no)+1;
          console.log("transactionno........"+newtransno);
       connection.query("SELECT * FROM md_payment_mode WHERE payment_modename='"+req.query.paymentmodename+"'",function(err, rows){
       if(!err){
        if(rows.length>0){  
        response.paid_status=rows[0].receive_status;    
        response.cheque_status=rows[0].receive_status;  
        response.receipt_no=(rows[0].receive_flag).substring(0,3)+"-"+response.academic_year+"-"+response.transaction_no;    
        response.receipt_type=rows[0].receive_flag;
        connection.query(insertqur,[response],function(err, result){
          if(!err){
          if(result.affectedRows>0)
          {
          connection.query("UPDATE sequence SET transaction_no='"+newtransno+"' WHERE school_id='"+req.query.schoolid+"'",function(err, result){
          if(!err){
          if(result.affectedRows>0)
          {
          res.status(200).json({'returnval': 'Saved!'});
          }
          else
          res.status(200).json({'returnval': 'Unable to save!'});
          }
          else{
           console.log(err);
           res.status(200).json({'returnval': err}); 
          }
          });
          }
          else
          res.status(200).json({'returnval': 'Unable to save!'});
          }
          else{
           console.log(err);
           res.status(200).json({'returnval': err}); 
          }            
        });
        }
      }
      else{
        console.log(err);
        res.status(200).json({'returnval': err}); 
      }
        });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/collection-deletecollectionpayment-service',  urlencodedParser,function (req, res){  
  var qur="DELETE FROM md_student_paidfee WHERE school_id='"+req.query.schoolid+"' AND admission_no='"+req.query.admissionno+"' AND academic_year='"+req.query.academicyear+"' and transaction_no='"+req.query.transactionno+"' and installment='"+req.query.feetype+"'";
  console.log('--------------collection history--------------');
  console.log(qur);
  connection.query(qur,
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Deleted!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to Delete!'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/collection-editcollectionpayment-service',  urlencodedParser,function (req, res){  
  var qur="UPDATE md_student_paidfee SET ? WHERE school_id='"+req.query.schoolid+"' AND admission_no='"+req.query.admissionno+"' AND academic_year='"+req.query.academicyear+"' and transaction_no='"+req.query.transno+"' and installment='"+req.query.feetype+"'";
  console.log('--------------collection history--------------');
  console.log(qur);
  var response={
    cheque_date:req.query.transactiondate,
    installment_date:req.query.transactiondate,
    cheque_no:req.query.transactionno,
    bank_name:req.query.transactionname,
    actual_amount:req.query.amount,
    installment_amount:req.query.amount,
    received_date:req.query.dateofpayment,
    receipt_date:req.query.dateofpayment
  }
  console.log(response);
  connection.query(qur,[response],
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Updated!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to Update!'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/collectionreportdaycollection-service',  urlencodedParser,function (req, res){
  if(req.query.type!="All"){
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and admission_status='"+req.query.type+"' and pdc_flag in('1') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"'";          
   var qur1 = "SELECT mode_of_payment,sum(installment_amount) as total FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and admission_status='"+req.query.type+"' and pdc_flag in('1') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' group by mode_of_payment";          
           
   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and admission_status='"+req.query.type+"' and pdc_flag in('1') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and grade in('"+req.query.grade+"') and school_id='"+req.query.schoolid+"'";          
   var qur1 = "SELECT mode_of_payment,sum(installment_amount) as total FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and admission_status='"+req.query.type+"' and pdc_flag in('1') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and grade in('"+req.query.grade+"') and school_id='"+req.query.schoolid+"' group by mode_of_payment";          

   }
  }
  else{
   if(req.query.grade=="All Grades"){
   var qur = "SELECT * FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and pdc_flag in('1') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' ";          
   var qur1 = "SELECT mode_of_payment,sum(installment_amount) as total FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and pdc_flag in('1') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' group by mode_of_payment";          

   }
   else
   {
   var qur = "SELECT * FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and pdc_flag in('1') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and grade in('"+req.query.grade+"') and school_id='"+req.query.schoolid+"'";          
   var qur1 = "SELECT mode_of_payment,sum(installment_amount) as total FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+req.query.todate+"','%m/%d/%Y')) "+
             ") and pdc_flag in('1') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and grade in('"+req.query.grade+"') and school_id='"+req.query.schoolid+"' group by mode_of_payment";          

   }
  }
 console.log('-----------------------collection report--------------------------');
 console.log(qur);
 console.log(qur1);
 // console.log(qur2);
 console.log('-------------------------------------------------');
 var todaycoll=[];
 var chequecoll=[];
   connection.query(qur,function(err, rows){
       if(!err){
        todaycoll=rows;
         // connection.query(qur1,function(err, rows){
         // if(!err){
         // chequecoll=rows;
         connection.query(qur1,function(err, rows){
         if(!err){
         res.status(200).json({'todaycoll': todaycoll,'returnval':rows});
         }
         });
         // }
         // else{
         //   console.log(err);
         //   res.status(200).json({'returnval':'no rows'});
         // }
         // });
         // if(rows.length>0){           
         // }
         // else{
         //   console.log(err);
         //   res.status(200).json({'returnval':'no rows'});
         // }
       }
       else{
         console.log(err);
       }
     });
 });

app.post('/collection-pendingfeecollectionreport-service',  urlencodedParser,function (req, res){
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
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   }
   if(req.query.type=='New'){
    var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount   from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='New' group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and admission_status='New' and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   }
   if(req.query.type=='Promoted'){
    var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='Promoted' group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and admission_status='Promoted' and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   }
   var pendingqur = "select admission_no,student_name,grade,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status not in "+
   "('paid','cleared','inprogress') and cheque_status in('bounced','cancelled') group by school_id,admission_no,student_name,grade";
   var qur="select * from fee_splitup where school_id='"+req.query.schoolid+"' and fee_type='Registration fee'";
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
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " and pf.class_for_admission='"+req.query.grade+"' group by pf.admission_no" ;
   }
   if(req.query.type=='New'){
   var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='New' group by school_id,admission_no,student_name";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " and pf.class_for_admission='"+req.query.grade+"' and admission_status='New' group by pf.admission_no" ;
   }
   if(req.query.type=='Promoted'){
   var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount,sum(difference_amount) as diffamount  from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') and admission_status='Promoted' group by school_id,admission_no,student_name";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " and pf.class_for_admission='"+req.query.grade+"' and admission_status='Promoted' group by pf.admission_no" ;
   }
   var pendingqur = "select admission_no,student_name,grade,sum(installment_amount) as pendingamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' AND school_id='"+req.query.schoolid+"' and grade='"+req.query.grade+"' and  paid_status not in "+
   "('paid','cleared','inprogress') and cheque_status in('bounced','cancelled') group by school_id,admission_no,student_name,grade";
   var qur="select * from fee_splitup where school_id='"+req.query.schoolid+"' and fee_type='Registration fee'";
   }
   var discountqur="SELECT admission_no,sum(discount_amount) as discount_amount FROM md_student_discount WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' group by admission_no";
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
 var regfee=[];
   connection.query(totalqur,function(err, rows){
       if(!err){         
          totalarr=rows;
          connection.query(paidqur,function(err, rows){
            if(!err){
              paidarr=rows;
              connection.query(pendingqur,function(err, rows){
              if(!err){
              pendingarr=rows;
              connection.query(qur,function(err, rows){
              if(!err){
              regfee=rows;
              connection.query(discountqur,function(err, rows){
              if(!err){
              res.status(200).json({'discount':rows,'regfee':regfee,'totalarr':totalarr,'paidarr':paidarr,'pendingarr':pendingarr});
              }
              });
              }
              });
              // res.status(200).json({'totalarr':totalarr,'paidarr':paidarr,'pendingarr':pendingarr});
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

 app.post('/collection-collectiondashboard-service',  urlencodedParser,function (req, res){

   var paidqur = "select admission_no,student_name,grade,sum(installment_amount) as paidamount,sum(discount_amount) as discountamount from "+
   "md_student_paidfee where academic_year='"+req.query.academicyear+"' and school_id='"+req.query.schoolid+"' and paid_status in "+
   "('paid','cleared','inprogress') and cheque_status not in('bounced','cancelled') group by school_id,admission_no,student_name,grade";
   var totalqur = "select * from md_admission pf join fee_master m "+
    "on(pf.admission_year=m.admission_year) where pf.academic_year='"+req.query.academicyear+"' "+
    " and pf.academic_year='"+req.query.academicyear+"' and pf.school_id='"+req.query.schoolid+"' "+
    " and m.school_id='"+req.query.schoolid+"' and pf.class_for_admission= "+
    " (select grade_name from grade_master where grade_id=m.grade_id) and pf.discount_type not in('3') and pf.active_status not in('Cancelled','Withdrawn')"+
    " group by pf.admission_no";
   var discountqur="SELECT admission_no,sum(discount_amount) as discount_amount FROM md_student_discount WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' group by admission_no";
   var d=new Date();
   var date=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
   var dayqur = "SELECT pdc_flag,sum(installment_amount)+sum(fine_amount) as amount FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and (STR_TO_DATE(paid_date,'%m/%d/%Y')=STR_TO_DATE('"+date+"','%m/%d/%Y')) "+
             "and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' group by pdc_flag";          
   var fromdate=(d.getMonth()+1)+"/"+"1"+"/"+d.getFullYear();
   var todate=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
   var monthqur = "SELECT pdc_flag,sum(installment_amount)+sum(fine_amount) as amount FROM md_student_paidfee where (paymenttype_flag is null||paymenttype_flag!='2') and ((STR_TO_DATE(paid_date,'%m/%d/%Y')>=STR_TO_DATE('"+fromdate+"','%m/%d/%Y') and STR_TO_DATE(paid_date,'%m/%d/%Y')<=STR_TO_DATE('"+todate+"','%m/%d/%Y')) "+
             ") and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' group by pdc_flag";          
 
 console.log('-----------------------pending fee report--------------------------');
 console.log(totalqur);
 console.log('-------------------------------------------------');
  console.log(paidqur);
 console.log('-------------------------------------------------');
  console.log(dayqur);
 console.log('-------------------------------------------------');
 console.log(monthqur);
 var totalarr=[];
 var paidarr=[];
 var pendingarr=[];
 var regfee=[];
 var discount=[];
   connection.query(totalqur,function(err, rows){
       if(!err){         
          totalarr=rows;
          connection.query(paidqur,function(err, rows){
          if(!err){
          paidarr=rows;
          connection.query(discountqur,function(err, rows){
          if(!err){
            discount=rows;
        if(totalarr.length>0){
        var pflag=0;
        var npflag=0;
        for(var i=0;i<totalarr.length;i++)
        {
          totalarr[i].sno=(i+1);
          var paidamount=0;
          var paidflag=0;
          var pendingamount=0;
          var pendingflag=0;
          var discountamount=0;
          if(paidarr.length>0){
          for(var j=0;j<paidarr.length;j++){
            if(totalarr[i].admission_no==paidarr[j].admission_no)
            {
              paidflag=1;
              paidamount=parseFloat(paidamount)+(parseFloat(paidarr[j].paidamount)-parseFloat(0));
              totalarr[i].paid_amount=paidamount;
              pflag++;
            }
          }
          if(paidflag==0)
            {
            paidamount=parseFloat(paidamount)+parseFloat(0);
            totalarr[i].paid_amount=paidamount;
            // totalarr[i].discount_amount=0;
            npflag++;
            }
          paidamount=0;
          paidflag=0;
          discountamount=0;
          }
        }
        }

        if(discount.length>0){
        for(var i=0;i<totalarr.length;i++){
          var f=0;
          for(var j=0;j<discount.length;j++){
            if(totalarr[i].admission_no==discount[j].admission_no){
              f=1;
              totalarr[i].discount_amount=discount[j].discount_amount;
            }
          }
          if(f==0)
            totalarr[i].discount_amount=0;
        }
        }
        for(var i=0;i<totalarr.length;i++){          
          totalarr[i].total_amount=parseFloat(totalarr[i].fees)-parseFloat(totalarr[i].discount_amount);
          totalarr[i].pending_amount=parseFloat(totalarr[i].total_amount)-parseFloat(totalarr[i].paid_amount);
        }
        var actual=0,discount=0,total=0,paid=0,pending=0;
        for(var i=0;i<totalarr.length;i++){
          actual=parseFloat(totalarr[i].fees)+parseFloat(actual);
          discount=parseFloat(totalarr[i].discount_amount)+parseFloat(discount);
          total=parseFloat(totalarr[i].total_amount)+parseFloat(total);
          paid=parseFloat(totalarr[i].paid_amount)+parseFloat(paid);
          pending=parseFloat(totalarr[i].pending_amount)+parseFloat(pending);
        }
      var dayarr=[];
       var montharr=[];
       var daycoll=0,daypdc=0,monthcoll=0,monthpdc=0;
       connection.query(dayqur,function(err, rows){
       if(!err){ 
        dayarr=rows;
       connection.query(monthqur,function(err, rows){
       if(!err){ 
        montharr=rows;
        if(dayarr.length>0){
          for(var i=0;i<dayarr.length;i++){
            if(dayarr[i].pdc_flag=="1")
              daycoll=dayarr[i].amount;
            if(dayarr[i].pdc_flag=="2")
              daypdc=dayarr[i].amount;
          }
        }
        if(montharr.length>0){
          for(var i=0;i<montharr.length;i++){
            if(montharr[i].pdc_flag=="1")
              monthcoll=montharr[i].amount;
            if(montharr[i].pdc_flag=="2")
              monthpdc=montharr[i].amount;
          }
        }
        var display=[];
        display.push({'dc':daycoll,'dp':daypdc,'mc':monthcoll,'mp':monthpdc,'actual':actual,'discount':discount,'total':total,'paid':paid,'pending':pending});

        res.status(200).json(display);
       }
       });
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

app.post('/collection-enrollmentdashboard-service',  urlencodedParser,function (req, res){
  
  var arr=[];
  var totalqur="SELECT status,count(enquiry_no) as total FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' group by status";
  var d=new Date();
  var fromdate=(d.getMonth()+1)+"/"+"1"+"/"+d.getFullYear();
  var todate=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
  var dayqur="SELECT status,count(enquiry_no) as total FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and (STR_TO_DATE(enquired_date,'%m/%d/%Y')=STR_TO_DATE('"+todate+"','%m/%d/%Y')) group by status";
  var monthqur="SELECT status,count(enquiry_no) as total FROM student_enquiry_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and (STR_TO_DATE(enquired_date,'%m/%d/%Y')>=STR_TO_DATE('"+fromdate+"','%m/%d/%Y')) and (STR_TO_DATE(enquired_date,'%m/%d/%Y')<=STR_TO_DATE('"+todate+"','%m/%d/%Y')) group by status";
  var totalarr=[];
  var day=[];
  var month=[];
  console.log(totalqur);
  console.log('---------------------------------------');
  console.log(dayqur);
  console.log('---------------------------------------');
  console.log(monthqur);
  console.log('---------------------------------------');
        connection.query(totalqur,function(err, rows){
          if(!err){
          if(rows.length>0){ 
            totalarr=rows;
          connection.query(dayqur,function(err, rows){
          if(!err){ 
            day=rows;
          connection.query(monthqur,function(err, rows){
          if(!err){  
            month=rows;
            var dayenq=0,monthenq=0,totalenq=0;
            var dayadmn=0,monthadmn=0,totaladmn=0;  
            var daywith=0,monthwith=0,totalwith=0;   
            if(totalarr.length>0){
              for(var i=0;i<totalarr.length;i++){
                totalenq=parseInt(totalarr[i].total)+parseInt(totalenq);
                if(totalarr[i].status=="Admitted"){
                  totaladmn=parseInt(totalarr[i].total)+parseInt(totaladmn);
                }
                if(totalarr[i].status=="Withdrawn"){
                  totalwith=parseInt(totalarr[i].total)+parseInt(totalwith);
                }
              }
            }
            if(day.length>0){
              for(var i=0;i<day.length;i++){
                dayenq=parseInt(day[i].total)+parseInt(dayenq);
                if(day[i].status=="Admitted"){
                  dayadmn=parseInt(day[i].total)+parseInt(dayadmn);
                }
                if(day[i].status=="Withdrawn"){
                  daywith=parseInt(day[i].total)+parseInt(daywith);
                }
              }
            }
            if(month.length>0){
              for(var i=0;i<month.length;i++){
                monthenq=parseInt(month[i].total)+parseInt(monthenq);
                if(month[i].status=="Admitted"){
                  monthadmn=parseInt(month[i].total)+parseInt(monthadmn);
                }
                if(month[i].status=="Withdrawn"){
                  monthwith=parseInt(month[i].total)+parseInt(monthwith);
                }
              }
            }
            var display=[];
            display.push({"todayenq":dayenq,"monthenq":monthenq,"totalenq":totalenq,"todayadmn":dayadmn,"monthadmn":monthadmn,"totaladmn":totaladmn,"todaywith":daywith,"monthwith":monthwith,"totalwith":totalwith});
           res.status(200).json(display);
          }
          else
            console.log(err);
          });
          }
          else
            console.log(err);
          });
          }
          else{
            console.log(err);
          }
          }
          else{
            console.log(err);
            res.status(200).json(arr);
          }
         });
});

app.post('/transport-collection-fetchallstudent-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and transport_availed='yes'";
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


app.post('/transport-collection-studentinfo-service',  urlencodedParser,function (req, res){
  var qurr="SELECT * FROM transport.student_zone_mapping f join transport.md_zone z on(f.zone_id=z.id) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and f.student_id='"+req.query.studentid+"' and f.student_name='"+req.query.studentname+"' and f.status='mapped' and z.school_id='"+req.query.schoolid+"' and z.academic_year='"+req.query.academicyear+"'";
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  console.log('------------------stud info for zone allocatezone-------------------------');
  console.log(qurr);
  console.log(qur);
  console.log('--------------------------------------------------------------------------');
  var feearr=[];
  var flag="";
  connection.query(qurr,function(err, rows){
  if(!err){
  if(rows.length>=0){
  feearr=rows;
  if(rows.length==0)
    flag="notmapped";
  if(rows.length>0)
    flag="mapped";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){

          res.status(200).json({'flag':flag,'feearr':feearr,'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
    }
  else
    res.status(200).json({'returnval': 'Already Mapped!!'});
  }
  });
});

app.post('/transport-fetchzone-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM transport.md_zone WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  var qur1="select distinct(start_date),end_date from transport.transport_details where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  console.log('-------------------------------------------');
  console.log(qur);
  console.log(qur1);
  var arr=[];
  var startdate="";
  var enddate="";
  connection.query(qur1,function(err, rows){
  if(!err){
    if(rows.length>0){
    arr=rows;
    startdate=arr[0].start_date;
    enddate=arr[0].end_date;
    }
  connection.query(qur,function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows,'startdate':startdate,'enddate':enddate});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows','startdate':'','enddate':''});
        }
      } else {
        console.log(err);
      }
  });
  }
  else {
        console.log(err);
      }
 });
});

app.post('/collection-fetchtransportzonefee-service',  urlencodedParser,function (req, res){
 
 var checkqur="SELECT * FROM transport.student_zone_mapping WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and status='changed'";
 var qur="SELECT * FROM transport.md_distance WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and id='"+req.query.distanceid+"'";
 var qur1="SELECT * FROM transport.student_zone_mapping WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and status='mapped'";
 console.log(checkqur);
 console.log(qur);
 connection.query(checkqur,function(err, rows)
 {
 if(!err){
 if(rows.length==0){
 connection.query(qur,function(err, rows)
    {
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows,'flag':'0'});
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
 }
 else{
  connection.query(qur,function(err, rows)
    {
      if(!err){
        if(rows.length>0){
          res.status(200).json({'returnval': rows,'flag':'1'});
        } 
        else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
  });
 }
 }
 });
});

app.post('/collection-allocatezone-service',  urlencodedParser,function (req, res){
  // var qur="SELECT * FROM transport.student_fee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and status='mapped'";
  var response={
    school_id:req.query.schoolid,
    academic_year:req.query.academicyear,
    student_id:req.query.studentid,
    student_name:req.query.studentname,
    admission_status:'',
    zone_id:'',
    zone_name:req.query.zonename,
    fees:req.query.fees,
    from_date:req.query.startdate,
    to_date:req.query.enddate,
    mode:req.query.mode,
    created_by:req.query.updatedby,
    status:'mapped',
    grade:req.query.grade,
    transaction_no:''
  };
  var qur="select admission_status from transport.student_details where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  var zonequr="select id from transport.md_zone where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and distance_id='"+req.query.zoneid+"'";
  var qur1="INSERT INTO transport.student_zone_mapping SET ?";
  console.log('-------------------------------------------');
  console.log(qur);
  var admissionstatus="";
  var zoneid="";
      connection.query(qur,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
        admissionstatus=rows[0].admission_status;
        response.admission_status=admissionstatus;
        connection.query(zonequr,function(err, rows){
        if(!err)
        {
        response.zone_id=rows[0].id;
        connection.query("SELECT transaction_seq FROM transport.receiptsequence WHERE school_id='"+req.query.schoolid+"'",function(err, rows){
        if(!err)
        {
        var seq=parseInt(rows[0].transaction_seq)+1;
        response.transaction_no=rows[0].transaction_seq;
        console.log(response);
        connection.query(qur1,[response],function(err, rows){
        if(!err)
        {
          connection.query("UPDATE transport.receiptsequence SET transaction_seq='"+seq+"' WHERE school_id='"+req.query.schoolid+"'",function(err, rows){
          if(!err)
          {
          res.status(200).json({'returnval': 'updated'});
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
        else {
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

app.post('/transport-collection-zoneinfo-service',  urlencodedParser,function (req, res){
  var checkqur="SELECT * FROM transport.student_zone_mapping WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and status='changed'";
  var qurr="SELECT * FROM transport.student_zone_mapping  f join transport.md_zone z on(f.zone_id=z.id) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and f.student_id='"+req.query.studentid+"' and f.student_name='"+req.query.studentname+"' and f.status='mapped' and z.school_id='"+req.query.schoolid+"' and z.academic_year='"+req.query.academicyear+"' and f.status='mapped'";
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  console.log('------------------stud info for zone allocatezone-------------------------');
  console.log(checkqur);
  console.log(qurr);
  console.log(qur);
  console.log('--------------------------------------------------------------------------');
  var feearr=[];
  var flag="";
  var changeflag="";
  connection.query(checkqur,function(err, rows){
  if(!err){
    if(rows.length>0)
      changeflag="1";
    else
      changeflag="0";
  connection.query(qurr,function(err, rows){
  if(!err){
  if(rows.length>=0){
  feearr=rows;
  if(rows.length==0)
    flag="notmapped";
  if(rows.length>0)
    flag="mapped";
  connection.query(qur,
    function(err, rows){
      if(!err){
        if(rows.length>0){
          res.status(200).json({'changeflag':changeflag,'flag':flag,'feearr':feearr,'returnval': rows});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
    }
  else
    res.status(200).json({'returnval': 'Already Mapped!!'});
  }
  });
  }
  });
});

app.post('/collection-transportfeeinfo-service',  urlencodedParser,function (req, res){
 
 var qur="SELECT * FROM transport_fee_schedule WHERE "+
 " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
 " and zone_name in(SELECT zone_name FROM transport.student_zone_mapping WHERE "+
 " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
 " student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"' and status='mapped')";
 console.log(qur);
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

app.post('/collection-transportdiscountinfo-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM transport.student_discount WHERE school_id='"+req.query.schoolid+"' and student_id='"+req.query.studentid+"' and academic_year='"+req.query.academicyear+"'";
  var qur1="SELECT * FROM transport_fee_schedule WHERE "+
  " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
  " and zone_name in(SELECT zone_name FROM transport.student_zone_mapping WHERE "+
  " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
  " student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"')";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  var arr=[];
  connection.query(qur,function(err, rows){
      if(!err)
      {
        arr=rows;
      connection.query(qur1,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': arr , 'discount': rows});
      }
      });
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-transportattachdiscount-service',  urlencodedParser,function (req, res){  
  var response={
    school_id:req.query.schoolid,
    academic_year:req.query.academicyear,
    student_id:req.query.admissionno,
    student_name:req.query.studentname,
    grade:req.query.gradename,
    availed_installment:req.query.discounttype,
    discount_amount:req.query.discountamount,
    reason:req.query.reason,
    availed_date:req.query.currdate,
    created_by:req.query.createdby,
    fee_type:req.query.feetype
  };
  var checkqur="SELECT * FROM transport.student_discount WHERE school_id='"+req.query.schoolid+"' AND "+
  " academic_year='"+req.query.academicyear+"' AND student_id='"+req.query.admissionno+"' AND "+
  " grade='"+req.query.gradename+"' AND availed_installment='"+req.query.discounttype+"'";
  var qur="INSERT INTO transport.student_discount SET ?";
  console.log(checkqur);
  console.log(qur);
  connection.query(checkqur,function(err, rows){
  if(!err){
  if(rows.length==0){
  connection.query(qur,[response],function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Updated'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to update'});
        }
      } else {
        console.log(err);
      }
    });
  }
  else{
    res.status(200).json({'returnval': 'exist'});
  }
  }
  });
});

app.post('/collection-transportfetchcollectionpaymenthistory-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND student_id='"+req.query.admissionno+"' AND academic_year='"+req.query.academicyear+"'";
  console.log('--------------collection history--------------');
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

app.post('/collection-transportfetchfeecollectionpaymentinfo-service',  urlencodedParser,function (req, res){  
  var checkqur="SELECT * FROM transport.zonechange_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  // var qur1="SELECT sum(amount) as amount FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  // " and zone_name in(SELECT zone_name FROM transport.student_zone_mapping WHERE "+
  // " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
  // " student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"' and status='mapped')";
  var qur1="SELECT fees as amount FROM transport.student_zone_mapping WHERE "+
  " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
  " student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"' and status='mapped'";
  var qur2="SELECT sum(discount_amount) as discount_amount FROM transport.student_discount WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and student_id='"+req.query.admissionno+"'";
  var qur3="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and student_id='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress')";
  var qur4="SELECT sum(fine_amount) as fine_amount FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and student_id='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('bounced')";
  console.log('--------------------To be collect----------------------');
  console.log(qur1);
  console.log(qur2);
  console.log(qur3);
  console.log(qur4);
  var total="0";
  var discount="0";
  var fineamount="0";
  var paidamount="0";
  var dueamount="0";
  var usedfee=0;
  connection.query(checkqur,function(err, rows){
    if(!err){
    if(rows.length==0){
  connection.query(qur1,function(err, rows){
      if(!err){
      if(rows.length>0){
      total=rows[0].amount;
      if(total==null||total=="")
      total=0; 
      }
      connection.query(qur2,function(err, rows){if(!err){ 
      if(rows.length>0){
      discount=rows[0].discount_amount; 
      if(discount==null||discount=="")
      discount=0; 
      }
      connection.query(qur3,function(err, rows){if(!err){
        if(rows.length>0) {
        paidamount=rows[0].installment_amount;        
        if(paidamount==null||paidamount=="")
        paidamount=0; 
        }
        connection.query(qur4,function(err, rows){if(!err){
        if(rows.length>0) {
        fineamount=rows[0].fine_amount;        
        if(fineamount==null||fineamount=="")
        fineamount=0; 
        }
        console.log(total+"  "+fineamount+"  "+paidamount+"  "+discount);
        dueamount=(parseFloat(total)+parseFloat(fineamount))-(parseFloat(paidamount)+parseFloat(discount));
        res.status(200).json({'total':total,'fineamount':fineamount,'discount':discount,'paidamount':paidamount,'dueamount':dueamount});     
      }
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
      else {
        console.log(err);
      }
    });

  }
  else{
    usedfee=rows[0].previous_zoneusedfee;
    connection.query(qur1,function(err, rows){
      if(!err){
      if(rows.length>0){
      total=rows[0].amount;
      if(total==null||total=="")
      total=0; 
      }
      connection.query(qur2,function(err, rows){if(!err){ 
      if(rows.length>0){
      discount=rows[0].discount_amount; 
      if(discount==null||discount=="")
      discount=0; 
      }
      connection.query(qur3,function(err, rows){if(!err){
        if(rows.length>0) {
        paidamount=rows[0].installment_amount;        
        if(paidamount==null||paidamount=="")
        paidamount=0; 
        }
        connection.query(qur4,function(err, rows){if(!err){
        if(rows.length>0) {
        fineamount=rows[0].fine_amount;        
        if(fineamount==null||fineamount=="")
        fineamount=0; 
        }
        console.log(total+"  "+fineamount+"  "+paidamount+"  "+discount);
        dueamount=(parseFloat(total)+parseFloat(fineamount))-(parseFloat(paidamount)+parseFloat(discount));
        total=parseFloat(total);
        res.status(200).json({'total':total,'fineamount':fineamount,'discount':discount,'paidamount':paidamount,'dueamount':dueamount});     
      }
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
      else {
        console.log(err);
      }
    });
  }
  }
  else
    console.log(err);
  });
});

app.post('/collection-transportfetchfeenetrycollectionfeetypeamount-service',  urlencodedParser,function (req, res){  
  var paidqur="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount,"+
  " sum(fine_amount) as fine_amount FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and student_id='"+req.query.admissionno+"' "+
  " and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress') "+
  " and installment_feetype='"+req.query.feetype+"'";
  var discountqur="SELECT sum(discount_amount) as discount_amount FROM transport.student_discount WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and student_id='"+req.query.admissionno+"' and fee_type='"+req.query.feetype+"' ";
  var feequr="SELECT fees as fee_amount FROM transport.student_zone_mapping WHERE "+
  " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
  " student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  var bouncequr="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount,sum(fine_amount) as fine_amount FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and student_id='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('bounced') "+
  " and installment_feetype='"+req.query.feetype+"'";

  console.log('---------------fee type amount fetch------------------');
  console.log(paidqur);
  console.log(discountqur);
  console.log(feequr);
  var feeamount=0;
  var paidamount=0;
  var discountamount=0;
  var dueamount=0;
  var fineamount=0;
  var bouncefine=0;
  connection.query(feequr,function(err, rows){
      if(!err){
        if(rows.length>0){
          if(rows[0].fee_amount==null||rows[0].fee_amount=="")
          feeamount=0;
          else
          feeamount=rows[0].fee_amount;
          connection.query(paidqur,function(err, rows){
          if(!err){
          if(rows.length>0){
          if(rows[0].installment_amount==null||rows[0].installment_amount=="")
          paidamount=0;
          else
          paidamount=rows[0].installment_amount;
          if(rows[0].fine_amount==null||rows[0].fine_amount=="")
          fineamount=0;
          else
          fineamount=rows[0].fine_amount;
          }
          connection.query(discountqur,function(err, rows){
          if(!err){
          if(rows[0].discount_amount==null||rows[0].discount_amount=="")
          discountamount=0;
          else
          discountamount=rows[0].discount_amount;
        connection.query(bouncequr,function(err, rows){
          if(!err){
          if(rows[0].fine_amount==null||rows[0].fine_amount=="")
          bouncefine=0;
          else
          bouncefine=rows[0].fine_amount;
          console.log(feeamount+" - "+fineamount+" - "+bouncefine+" - "+paidamount+" - "+discountamount);
          dueamount=(parseInt(feeamount)+parseInt(fineamount)+parseInt(bouncefine))-(parseInt(paidamount)+parseInt(discountamount));
          res.status(200).json({'dueamount':dueamount});
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
      } else {
        console.log(err);
      }
  });
});

app.post('/collection-transportmakepayment-service',  urlencodedParser,function (req, res){  
  var seqqur="SELECT * FROM transport.receiptsequence WHERE school_id='"+req.query.schoolid+"'";
  var insertqur="INSERT INTO transport.student_paidfee SET ?";
  console.log(seqqur);
  console.log(insertqur);
  var response={
    school_id:req.query.schoolid,   
    academic_year:req.query.academicyear,
    student_id:req.query.admissionno,
    student_name:req.query.studentname,
    admission_status:req.query.admissionstatus,
    grade:req.query.gradename,
    zone_id:'',
    zone_name:'',
    receipt_no:'',
    installment:req.query.installment,
    installment_amount:req.query.amount,
    fees:'',
    installment_date:req.query.installmentdate,
    mode_of_payment:req.query.paymentmodename,
    from_date:'',
    to_date:'',
    mode:'',
    status:'',
    paid_status:'',
    fine_amount:'0',
    paid_date:req.query.dateofpayment,
    receipt_date:req.query.dateofpayment,
    installment_pattern:req.query.paymenttype,
    transaction_no:'',
    cheque_no:req.query.transactionno,
    bank_name:req.query.transactionname,
    cheque_date:req.query.transactiondate,
    cheque_status:'',
    updated_by:req.query.createdby, 
    pdc_flag:req.query.pdcflag,
    receipt_type:'',
    installment_feetype:req.query.paymentfeetype,
    payment_type:req.query.typeid
  };
  // if(req.query.paymentmodename!="Cheque")
    // response.cheque_date=req.query.paiddate;
  // console.log(response);
  var receipttype="";
  connection.query(seqqur,function(err, rows){
      if(!err){
        if(rows.length>0){
          response.transaction_no=rows[0].transaction_seq;
          var newtransno=parseInt(rows[0].transaction_seq)+1;
          console.log("transactionno........"+newtransno);
       connection.query("SELECT * FROM md_payment_mode WHERE payment_modename='"+req.query.paymentmodename+"'",function(err, rows){
       if(!err){
        if(rows.length>0){  
        response.paid_status=rows[0].receive_status;    
        response.cheque_status=rows[0].receive_status;  
        response.receipt_no=(rows[0].receive_flag).substring(0,3)+"-"+response.academic_year+"-"+response.transaction_no;    
        response.receipt_type=rows[0].receive_flag;
        connection.query("SELECT * FROM transport.student_zone_mapping WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND student_id='"+req.query.admissionno+"' AND status='mapped'",function(err, rows){
       if(!err){
        if(rows.length>0){ 
        response.fees=rows[0].fees;
        response.zone_id=rows[0].zone_id;
        response.zone_name=rows[0].zone_name;
        response.from_date=rows[0].from_date;
        response.to_date=rows[0].to_date;
        response.status=rows[0].status;
        response.mode=rows[0].mode;
        connection.query(insertqur,[response],function(err, result){
          if(!err){
          if(result.affectedRows>0)
          {
          connection.query("UPDATE transport.receiptsequence SET transaction_seq='"+newtransno+"' WHERE school_id='"+req.query.schoolid+"'",function(err, result){
          if(!err){
          if(result.affectedRows>0)
          {
          res.status(200).json({'returnval': 'Saved!'});
          }
          else
          res.status(200).json({'returnval': 'Unable to save!'});
          }
          else{
           console.log(err);
           res.status(200).json({'returnval': err}); 
          }
          });
          }
          else
          res.status(200).json({'returnval': 'Unable to save!'});
          }
          else{
           console.log(err);
           res.status(200).json({'returnval': err}); 
          }            
        });
      }
    }
    else{
      console.log(err);
      res.status(200).json({'returnval': err}); 
    }
  });
        }
      }
      else{
        console.log(err);
        res.status(200).json({'returnval': err}); 
      }
        });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/collection-transporteditcollectionpayment-service',  urlencodedParser,function (req, res){  
  var qur="UPDATE transport.student_paidfee SET ? WHERE school_id='"+req.query.schoolid+"' AND student_id='"+req.query.admissionno+"' AND academic_year='"+req.query.academicyear+"' and transaction_no='"+req.query.transno+"' and installment='"+req.query.installment+"' and installment_feetype='"+req.query.feetype+"'";
  console.log('--------------collection history--------------');
  console.log(qur);
  var response={
    cheque_date:req.query.transactiondate,
    installment_date:req.query.transactiondate,
    cheque_no:req.query.transactionno,
    bank_name:req.query.transactionname,
    installment_amount:req.query.amount,
    receipt_date:req.query.dateofpayment
  }
  console.log(response);
  connection.query(qur,[response],
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Updated!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to Update!'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/collection-transportdeletecollectionpayment-service',  urlencodedParser,function (req, res){  
  var qur="DELETE FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND student_id='"+req.query.admissionno+"' AND academic_year='"+req.query.academicyear+"' and transaction_no='"+req.query.transactionno+"' and installment_feetype='"+req.query.feetype+"' and installment='"+req.query.installment+"'";
  console.log('--------------collection history--------------');
  console.log(qur);
  connection.query(qur,
    function(err, result){
      if(!err){
        if(result.affectedRows>0){
          res.status(200).json({'returnval': 'Deleted!'});
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Unable to Delete!'});
        }
      } else {
        console.log(err);
      }
    });
});

app.post('/collection-transportfetchcollectionpaymenthistory-service1',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND student_id='"+req.query.admissionno+"' AND academic_year='"+req.query.academicyear+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress')";
  console.log('--------------collection history--------------');
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

app.post('/collection-transportreceiptinfo-service',  urlencodedParser,function (req, res){  
  var qur="SELECT * FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' and student_id='"+req.query.admissionno+"' and academic_year='"+req.query.academicyear+"'";
  console.log("----------------------Collection - Selecting student---------------------");
  console.log(qur);
  connection.query(qur,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': rows});
      }
      else
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-transportfetchcollectionfeetypetocollect-service',  urlencodedParser,function (req, res){  
  // var qur="SELECT distinct(fee_type) as fee_type,type FROM transport_fee_schedule WHERE "+
  // " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  var qur="SELECT distinct(fee_type) as fee_type,type FROM md_fee_type WHERE school_id='"+req.query.schoolid+"' and flag='2'";
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

app.post('/collection-transportfetchcollectionpaymentinstallment-service',  urlencodedParser,function (req, res){  
  var qur="SELECT distinct(installment) as installment,REPLACE(installment,' ','') as installmentid FROM md_feetype_installment WHERE "+
  " payment_typeid='"+req.query.typeid+"' and fee_type='"+req.query.feetype+"'";
  // var qur="SELECT distinct(installment) as installment FROM transport_fee_schedule WHERE "+
  // " school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  // var qur="SELECT distinct(common_feetype),type FROM md_fee_type WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
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

app.post('/collection-fetchfeenetrycollectionfeetypeinstallmentamount-service',  urlencodedParser,function (req, res){  
  
  var status="";
  var paidqur="";
  var discountqur="";
  var feequr="";
  var bouncequr="";
  var checkqur="SELECT * FROM transport.zonechange_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  var feeamount=0;
  var paidamount=0;
  var discountamount=0;
  var dueamount=0;
  var fineamount=0;
  var bouncefine=0;
  connection.query(checkqur,function(err, rows){
  if(!err){
    if(rows.length==0){
    status="mapped";
    }
    else{
    status="changed";
    }
  if(req.query.installment=="Lumpsum"){
  paidqur="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount,sum(fine_amount) as fine_amount FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and student_id='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress') "+
  " and installment_feetype='"+req.query.feetype+"' and installment='"+req.query.installment+"'";
  discountqur="SELECT sum(discount_amount) as discount_amount FROM transport.student_discount WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and student_id='"+req.query.admissionno+"' and fee_type='"+req.query.feetype+"'";
  if(req.query.feetype=="Zonechange Fee")
  feequr="SELECT fees as fee_amount,DATE_FORMAT(CURDATE(), '%d/%m/%Y') as installment_date FROM transport.zonechange_master WHERE student_id='"+req.query.admissionno+"' AND school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"'";
  else
  feequr="SELECT sum(amount) as fee_amount,DATE_FORMAT(CURDATE(), '%d/%m/%Y') as installment_date FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' "+
  " and fee_type='"+req.query.feetype+"' and zone_name in "+
  " (SELECT zone_name FROM transport.student_zone_mapping WHERE student_id='"+req.query.admissionno+"' AND school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' and status='"+status+"') AND academic_year='"+req.query.academicyear+"'";
  bouncequr="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount,sum(fine_amount) as fine_amount FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and student_id='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('bounced') "+
  " and installment_feetype='"+req.query.feetype+"' and installment='"+req.query.installment+"' ";
  }
  else{
  paidqur="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount,sum(fine_amount) as fine_amount FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and student_id='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress') "+
  " and installment_feetype='"+req.query.feetype+"' and installment='"+req.query.installment+"'";
  discountqur="SELECT sum(discount_amount) as discount_amount FROM transport.student_discount WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and student_id='"+req.query.admissionno+"' and fee_type='"+req.query.feetype+"' and availed_installment='"+req.query.installment+"'";
  if(req.query.feetype=="Zonechange Fee")
  feequr="SELECT fees as fee_amount,DATE_FORMAT(CURDATE(), '%d/%m/%Y') as installment_date FROM transport.zonechange_master WHERE student_id='"+req.query.admissionno+"' AND school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"'";
  else
  feequr="SELECT sum(amount) as fee_amount,installment_date FROM transport_fee_schedule WHERE school_id='"+req.query.schoolid+"' "+
  " and fee_type='"+req.query.feetype+"' and installment='"+req.query.installment+"' and zone_name in "+
  " (SELECT zone_name FROM transport.student_zone_mapping WHERE student_id='"+req.query.admissionno+"' AND school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' and status='"+status+"') AND academic_year='"+req.query.academicyear+"'";
  bouncequr="SELECT sum(installment_amount)+sum(fine_amount) as installment_amount,sum(fine_amount) as fine_amount FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' "+
  " and grade='"+req.query.gradename+"' and student_id='"+req.query.admissionno+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('bounced') "+
  " and installment_feetype='"+req.query.feetype+"' and installment='"+req.query.installment+"' ";
  }
  console.log('---------------fee type amount fetch for installment------------------');
  console.log(paidqur);
  console.log(discountqur);
  console.log(feequr);
  console.log(checkqur);
  var installmentdate="";
  connection.query(feequr,function(err, rows){
      if(!err){
        if(rows.length>0){
          installmentdate=rows[0].installment_date;
          if(rows[0].fee_amount==null||rows[0].fee_amount=="")
          feeamount=0;
          else
          feeamount=rows[0].fee_amount;
          connection.query(paidqur,function(err, rows){
          if(!err){
          if(rows.length>0){
          if(rows[0].installment_amount==null||rows[0].installment_amount=="")
          paidamount=0;
          else
          paidamount=rows[0].installment_amount;
          if(rows[0].fine_amount==null||rows[0].fine_amount=="")
          fineamount=0;
          else
          fineamount=rows[0].fine_amount;
          }
          connection.query(discountqur,function(err, rows){
          if(!err){
          if(rows[0].discount_amount==null||rows[0].discount_amount=="")
          discountamount=0;
          else
          discountamount=rows[0].discount_amount;
          connection.query(bouncequr,function(err, rows){
          if(!err){
          if(rows[0].fine_amount==null||rows[0].fine_amount=="")
          bouncefine=0;
          else
          bouncefine=rows[0].fine_amount;
          console.log((parseInt(feeamount)+" "+parseInt(fineamount)+" "+parseInt(bouncefine))+" "+(parseInt(paidamount)+" "+parseInt(discountamount)));
          dueamount=(parseInt(feeamount)+parseInt(fineamount)+parseInt(bouncefine))-(parseInt(paidamount)+parseInt(discountamount));
          // if(req.query.installment=="Lumpsum"&&dueamount==0)
          res.status(200).json({'dueamount':dueamount,'installmentdate':installmentdate,'installment':req.query.installment});
          // if(req.query.installment=="Lumpsum"&&dueamount==0&&status=="changed")
          // {
                          // if(status=="changed"){
                          // connection.query("SELECT fees as fee_amount,DATE_FORMAT(CURDATE(), '%m/%d/%Y') as installment_date FROM transport.zonechange_master WHERE student_id='"+req.query.admissionno+"' AND school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"'",function(err, rows){
                          //   if(!err){
                          //     dueamount=Math.abs(parseFloat(dueamount)-parseFloat(rows[0].fee_amount));
                          //     installmentdate=rows[0].installment_date;
                          //   res.status(200).json({'dueamount':dueamount,'installmentdate':installmentdate,'installment':"Zonechange Fee"});
                          //   }
                          // });
                          // }
                          // else{
                          // res.status(200).json({'dueamount':dueamount,'installmentdate':installmentdate,'installment':req.query.installment});    
                          // }
          // }
        }
        });
          }
          });
          }
          });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows','installmentdate':installmentdate});
        }
      } else {
        console.log(err);
      }
  });
// }
// else{

// }
}
});
});

app.post('/collection-fetchtransportdaycollection-service',  urlencodedParser,function (req, res){

    if(req.query.type=="All"){
    var qur = "SELECT * FROM transport.student_paidfee where ((STR_TO_DATE(paid_date,'%d/%m/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%d/%m/%Y') and STR_TO_DATE(paid_date,'%d/%m/%Y')<=STR_TO_DATE('"+req.query.todate+"','%d/%m/%Y')) "+
             ") and pdc_flag in('1','2') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' ";          
    var qur1 = "SELECT mode_of_payment,sum(installment_amount) as total FROM transport.student_paidfee where ((STR_TO_DATE(paid_date,'%d/%m/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%d/%m/%Y') and STR_TO_DATE(paid_date,'%d/%m/%Y')<=STR_TO_DATE('"+req.query.todate+"','%d/%m/%Y')) "+
             ") and pdc_flag in('1','2') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' group by mode_of_payment";          
    }
    else{
    var qur = "SELECT * FROM transport.student_paidfee where ((STR_TO_DATE(paid_date,'%d/%m/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%d/%m/%Y') and STR_TO_DATE(paid_date,'%d/%m/%Y')<=STR_TO_DATE('"+req.query.todate+"','%d/%m/%Y')) "+
             ") and pdc_flag in('1','2') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' and installment='"+req.query.type+"'";          
    var qur1 = "SELECT mode_of_payment,sum(installment_amount) as total FROM transport.student_paidfee where ((STR_TO_DATE(paid_date,'%d/%m/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%d/%m/%Y') and STR_TO_DATE(paid_date,'%d/%m/%Y')<=STR_TO_DATE('"+req.query.todate+"','%d/%m/%Y')) "+
             ") and pdc_flag in('1','2') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' and installment='"+req.query.type+"' group by mode_of_payment";          
    }
 console.log('-----------------------collection report--------------------------');
 console.log(qur);
 console.log(qur1);

 console.log('-------------------------------------------------');
 var todaycoll=[];
 var chequecoll=[];
   connection.query(qur,function(err, rows){
       if(!err){
        todaycoll=rows;
         connection.query(qur1,function(err, rows){
         if(!err){
         res.status(200).json({'todaycoll': todaycoll,'returnval':rows});
         }
         });
       }
       else{
         console.log(err);
       }
     });
 });


app.post('/collection-fetchtransportpdccollection-service',  urlencodedParser,function (req, res){

  
    var qur = "SELECT * FROM transport.student_paidfee where ((STR_TO_DATE(paid_date,'%d/%m/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%d/%m/%Y') and STR_TO_DATE(paid_date,'%d/%m/%Y')<=STR_TO_DATE('"+req.query.todate+"','%d/%m/%Y')) "+
             ") and pdc_flag in('2') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' ";          
    var qur1 = "SELECT mode_of_payment,sum(installment_amount) as total FROM transport.student_paidfee where ((STR_TO_DATE(paid_date,'%d/%m/%Y')>=STR_TO_DATE('"+req.query.fromdate+"','%d/%m/%Y') and STR_TO_DATE(paid_date,'%d/%m/%Y')<=STR_TO_DATE('"+req.query.todate+"','%d/%m/%Y')) "+
             ") and pdc_flag in('2') and paid_status in('paid','inprogress','cleared') and cheque_status in('paid','inprogress','cleared') and school_id='"+req.query.schoolid+"' group by mode_of_payment";          
    
 console.log('-----------------------collection report--------------------------');
 console.log(qur);
 console.log(qur1);

 console.log('-------------------------------------------------');
 var todaycoll=[];
 var chequecoll=[];
   connection.query(qur,function(err, rows){
       if(!err){
        todaycoll=rows;
         connection.query(qur1,function(err, rows){
         if(!err){
         res.status(200).json({'todaycoll': todaycoll,'returnval':rows});
         }
         });
       }
       else{
         console.log(err);
       }
     });
 });

app.post('/transportfetchtransportpendingfee-service',  urlencodedParser,function (req, res){
  if(req.query.grade=="All Grades"){  
  if(req.query.type=="All")
  // var qur1="select * from transport.student_paidfee f join transport.student_details d on(f.student_id=d.id) where f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"' ";
  var qur1="select school_id,academic_year,student_id,student_name,admission_status,zone_name,installment, "+
  " sum(installment_amount) as installment_amount,sum(fine_amount) as fine_amount,fees,grade,(select payment_typename from md_payment_type where "+
  " payment_typeid=f.payment_type) as payment_type from transport.student_paidfee f where school_id='"+req.query.schoolid+"' "+
  " and academic_year='"+req.query.academicyear+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress') group by school_id,academic_year,student_id,student_name,admission_status, "+
  " zone_name,installment,fees,grade,payment_type order by installment,student_id";
  else
  // var qur1="select * from transport.student_paidfee f join transport.student_details d on(f.student_id=d.id) where f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"' and d.admission_status='"+req.query.type+"' and f.admission_status='"+req.query.type+"'";
  var qur1="select school_id,academic_year,student_id,student_name,admission_status,zone_name,installment, "+
  " sum(installment_amount) as installment_amount,sum(fine_amount) as fine_amount,fees,grade,(select payment_typename from md_payment_type where "+
  " payment_typeid=f.payment_type) as payment_type from transport.student_paidfee f where school_id='"+req.query.schoolid+"' "+
  " and academic_year='"+req.query.academicyear+"' and admission_status='"+req.query.type+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress') group by school_id,academic_year,student_id,student_name,admission_status, "+
  " zone_name,installment,fees,grade,payment_type order by installment,student_id";
  }
  else
  {
  if(req.query.type=="All")
  // var qur1="select * from transport.student_paidfee f join transport.student_details d on(f.student_id=d.id) where f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"' and d.class='"+req.query.grade+"'";
  var qur1="select school_id,academic_year,student_id,student_name,admission_status,zone_name,installment, "+
  " sum(installment_amount) as installment_amount,sum(fine_amount) as fine_amount,fees,grade,(select payment_typename from md_payment_type where "+
  " payment_typeid=f.payment_type) as payment_type from transport.student_paidfee f where school_id='"+req.query.schoolid+"' "+
  " and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress') group by school_id,academic_year,student_id,student_name,admission_status, "+
  " zone_name,installment,fees,grade,payment_type order by installment,student_id";
  else
  var qur1="select school_id,academic_year,student_id,student_name,admission_status,zone_name,installment, "+
  " sum(installment_amount) as installment_amount,sum(fine_amount) as fine_amount,fees,grade,(select payment_typename from md_payment_type where "+
  " payment_typeid=f.payment_type) as payment_type from transport.student_paidfee f where school_id='"+req.query.schoolid+"' "+
  " and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and admission_status='"+req.query.type+"' and paid_status in('paid','cleared','inprogress') and cheque_status in('paid','cleared','inprogress') group by school_id,academic_year,student_id,student_name,admission_status, "+
  " zone_name,installment,fees,grade,payment_type order by installment,student_id";
  // var qur1="select * from transport.student_paidfee f join transport.student_details d on(f.student_id=d.id) where f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' and d.school_id='"+req.query.schoolid+"' and d.academic_year='"+req.query.academicyear+"' and d.class='"+req.query.grade+"' and d.admission_status='"+req.query.type+"' and f.admission_status='"+req.query.type+"'";
  }
  var qur2="SELECT * FROM transport.student_zone_mapping WHERE student_id in(SELECT student_id FROM transport.zonechange_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"') and status='mapped'";
  var qur3="SELECT distinct(installment) as installment FROM md_feetype_installment WHERE fee_type in('Transport Fee','Zonechange Fee') order by installment";
  // var qur3="SELECT * FROM md_feetype_installment WHERE fee_type in('Transport Fee','Zonechange Fee') order by payment_typeid";
  var qur4="SELECT * FROM transport.student_discount WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'";
  var qur5="select sum(fine_amount) as fine_amount,student_id from transport.student_paidfee where school_id='"+req.query.schoolid+"' "+
  " and academic_year='"+req.query.academicyear+"' and cheque_status in('bounced','cancelled') group by student_id";
  console.log('-------------------------------------------');
  console.log(qur1);
  console.log(qur2);
  console.log(qur3);
  console.log(qur4);
  console.log(qur5);
  var arr=[];
  var change=[];
  var installment=[];
  var discount=[];
  connection.query(qur1,function(err, rows){
      if(!err)
      {
        arr=rows;
        connection.query(qur2,function(err, rows){
        if(!err){
        change=rows;
        connection.query(qur3,function(err, rows){
        if(!err){
        installment=rows;
        connection.query(qur4,function(err, rows){
        if(!err){
        discount=rows;
        connection.query(qur5,function(err, rows){
        if(!err){
        res.status(200).json({'returnval': arr,'change':change,'installment':installment,'discount':discount,'fine':rows});
        }
        });
        }
        else{
          console.log("1...."+err);
        }
        });
        }
        else{
          console.log("1...."+err);
        }
        });
        }
        else{
          console.log("1...."+err);
        }
        });
      } 
      else 
      {
        console.log(err);
        res.status(200).json({'returnval': 'no rows'});
      }
  });
});

app.post('/collection-transportdailycollection-service',  urlencodedParser,function (req, res){
  
  var totqur="select school_id,(select name from transport.md_school where id=school_id) "+
  " as schoolname ,admission_status ,count(distinct(student_id)) as totcnt,sum(installment_amount) as "+
  " tottotal from transport.student_paidfee where "+
  " academic_year='"+req.query.academicyear+"' and paid_date is not null and paid_status not in('bounced','cancelled') and cheque_status not in('bounced','cancelled')"+
  " group by school_id,admission_status";
  var todayqur="select school_id,(select name from transport.md_school where id=school_id) "+
  " as schoolname ,admission_status,count(distinct(student_id)) as todaycnt,sum(installment_amount) "+
  " as todaytotal from transport.student_paidfee where "+
  " academic_year='"+req.query.academicyear+"' and paid_date is not null and "+
  " STR_TO_DATE(paid_date,'%d/%m/%Y')=STR_TO_DATE('"+req.query.currdate+"','%d/%m/%Y') and paid_status not in('bounced','cancelled') and cheque_status not in('bounced','cancelled')"+
  " group by school_id,admission_status";

  console.log('-------------------------------------------');
  console.log(totqur);
  console.log(todayqur);
  var total=[];
  var today=[];
  connection.query(totqur,function(err, rows){
      if(!err)
      {
        total=rows;
      connection.query(todayqur,function(err, rows){
      if(!err)
      {
        today=rows;
        res.status(200).json({'total': total,'today': today});
      }
      else
      console.log(err); 
      });
      }
      else
      {
        console.log(err);
      }
  });
});

app.post('/collection-fetchalltransportstudent-service',  urlencodedParser,function (req, res){
  var queryy="SELECT distinct(student_id),student_name as name FROM transport.student_paidfee "+
  " WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
  " and cheque_status not in('cancelled','bounced') and paid_status not in('cancelled','bounced') ";
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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

app.post('/collection-processtransportbouncecheque-servicee',  urlencodedParser,function (req, res){
  console.log('---------------------'+req.query.id);
  var queryy="SELECT * FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
  " and  ((student_id='"+req.query.id+"' and student_name='"+req.query.studentname+"') or (cheque_no='"+req.query.id+"')) and cheque_status not in('cancelled','bounced') and paid_status not in('cancelled','bounced') and mode_of_payment in('Cheque')";
  console.log('-------------------------------------------');
  console.log(queryy);  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } 
        else{
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

app.post('/collection-updatetransportchequestatus-service',urlencodedParser,function (req, res){
  var waiveoff=0;
  if(req.query.waiveoff==0)
    waiveoff=250;
  if(req.query.waiveoff==1)
    waiveoff=0;
  var queryy1="UPDATE  transport.student_paidfee SET paid_status='inprogress',cheque_status='"+req.query.chequestatus+"',fine_amount='"+waiveoff+"',process_date='"+req.query.date+"' WHERE school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"' and installment='"+req.query.installment+"' and mode_of_payment='Cheque' and cheque_no='"+req.query.chequeno+"'";

  console.log('-------------------------------------------');
  console.log(queryy1); 
  connection.query(queryy1,function(err, result){
      if(!err)
      {
        if(result.affectedRows>0){        
            res.status(200).json({'returnval': 'Updated!'});
        } 
        else{
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!!'});
        }
      }
      else
      {
        console.log(err);
      }
  });
});

app.post('/collection-fetchstudentforcancellation-service',  urlencodedParser,function (req, res){
  var queryy="SELECT a.admission_no,a.student_name FROM transport.student_zone_mapping f join md_admission a on(f.student_id=a.admission_no) WHERE f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' "+
  " and a.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and f.status='mapped'";
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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

app.post('/collection-fetchstudinfoforcancellation-service',  urlencodedParser,function (req, res){
  var queryy="SELECT a.admission_no,a.student_name,z.zone_name,a.class_for_admission,a.father_name FROM transport.student_zone_mapping f join md_admission a on(f.student_id=a.admission_no) join transport.md_zone z on(f.zone_id=z.id) WHERE z.school_id='"+req.query.schoolid+"' and z.academic_year='"+req.query.academicyear+"' and f.school_id='"+req.query.schoolid+"' and f.academic_year='"+req.query.academicyear+"' "+
  " and a.school_id='"+req.query.schoolid+"' and a.academic_year='"+req.query.academicyear+"' and f.student_id='"+req.query.studentid+"' and f.student_name='"+req.query.studentname+"' and a.student_name='"+req.query.studentname+"'";
  console.log('-------------------------------------------');
  console.log(queryy);
  
  connection.query(queryy,function(err, rows){
      if(!err)
      {
        if(rows.length>0){
          res.status(200).json({'returnval': rows});
        } else {
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

app.post('/collection-transportcancellation-service',  urlencodedParser,function (req, res){
  
  var queryy="update transport.student_paidfee set status='cancelled' where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  var queryy1="update transport.student_zone_mapping set status='cancelled' where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  var qur="DELETE FROM transport.student_point where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  console.log('-------------------------------------------');
  console.log(queryy);
  console.log(qur);
  
  connection.query(queryy,function(err, result){
      if(!err)
      {
        if(result.affectedRows>0){
          connection.query(queryy1,function(err, result){
          if(!err)
          {
          connection.query(qur,function(err, result){
          res.status(200).json({'returnval': 'Updated!!'});
          });
          }
          });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!!'});
        }
      }
      else
      {
        console.log(err);
      }
  });

});

app.post('/collection-cancelzone-service',  urlencodedParser,function (req, res){
  var queryy1="DELETE FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'"+
  " and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  var queryy2="DELETE FROM transport.student_zone_mapping WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'"+
  " and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  var queryy3="DELETE FROM transport.zonechange_master WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'"+
  " and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  var queryy4="DELETE FROM transport.student_point where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  console.log('-------------------------------------------');
  console.log(queryy1);
  console.log(queryy2);
  
  connection.query(queryy1,function(err, rows){
      if(!err)
      {
      connection.query(queryy2,function(err, rows){
      if(!err)
      {
      connection.query(queryy3,function(err, rows){
      if(!err)
      {
      connection.query(queryy4,function(err, rows){
      if(!err)
      {
        res.status(200).json({'returnval': 'Updated!'});
      }
      });
      }
      });
      }
      else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!'});
        }
      });
      }
      else
      console.log(err);
  });
});

app.post('/collection-fetchstudentinfoforzonechange-service',  urlencodedParser,function (req, res){
  var qurr="SELECT * FROM transport.student_zone_mapping WHERE school_id='"+req.query.schoolid+"' and "+
  " academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and status='mapped'"+
  " and student_name='"+req.query.studentname+"' and status='mapped'";
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and admission_no='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  var paid="SELECT sum(installment_amount) as amount FROM transport.student_paidfee WHERE school_id='"+req.query.schoolid+"' "+
  " AND academic_year='"+req.query.academicyear+"' AND student_id='"+req.query.studentid+"' AND student_name='"+req.query.studentname+"' "+
  " AND paid_status not in('bounced','cancelled') AND cheque_status not in('bounced','cancelled')";
  var discount="SELECT sum(discount_amount) as amount FROM transport.student_discount WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'";
  console.log('------------------stud info for zone changezone-------------------------');
  console.log(qurr);
  console.log(qur);
  console.log(paid);
  console.log(discount);
  console.log('--------------------------------------------------------------------------');
  var feearr=[];
  var flag="";
  var info=[];
  var paidamount=0;
  var discountamount=0;
  var pendingamount=0;
  var fees=0;
  connection.query(qurr,function(err, rows){
  if(!err){
  if(rows.length>=0){
  feearr=rows;
  fees=feearr[0].fees;
  if(rows.length==0)
    flag="notmapped";
  if(rows.length>0)
    flag="mapped";
  connection.query(qur,function(err, rows){
      if(!err){
        if(rows.length>0){
          info=rows;
          connection.query(paid,function(err, rows){
          if(!err){
          if(rows.length>0)
          {
           if(rows[0].amount==""||rows[0].amount==null)
            paidamount=0;
           else
            paidamount=rows[0].amount;
          }
          connection.query(discount,function(err, rows){
          if(!err){
          if(rows.length>0)
          {
           if(rows[0].amount==""||rows[0].amount==null)
            discountamount=0;
           else
            discountamount=rows[0].amount;
          }
          pendingamount=parseFloat(fees)-parseFloat(discountamount)-parseFloat(paidamount);
          res.status(200).json({'flag':flag,'feearr':feearr,'returnval': info,'paidamount':paidamount,'discountamount':discountamount,'pendingamount':pendingamount});
          }
          });
          }
          });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'no rows'});
        }
      } else {
        console.log(err);
      }
    });
    }
  else
    res.status(200).json({'returnval': 'Already Mapped!!'});
  }
  });
});

app.post('/collection-fetchallstudentforzone-service',  urlencodedParser,function (req, res){
  var qur="SELECT * FROM md_admission WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and transport_availed='yes'";
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

app.post('/collection-fetchzonefee-service',  urlencodedParser,function (req, res){
 
 var qur="SELECT * FROM transport.md_distance WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and id='"+req.query.distanceid+"'";
 console.log(qur);
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

app.post('/collection-savezonechange-service',  urlencodedParser,function (req, res){
  var queryy="INSERT INTO transport.zonechange_master SET ?";
  var response={
    school_id: req.query.schoolid,
    academic_year:req.query.academicyear,
    student_id: req.query.studentid,
    student_name: req.query.studentname,
    zone_id: req.query.zoneid,
    zone_name: req.query.zonename,
    fees: req.query.amount,
    mode: req.query.mode,
    previous_zone: req.query.previouszone,
    previous_zonefee: req.query.previouszonefee,
    previous_zonepaidfee: req.query.previouszonepaidamount,
    previous_zoneusedfee: req.query.usedfee,
    new_zone: req.query.zonename,
    new_zoneactualfee: req.query.newzoneactualpayablefee,
    new_zonefee: req.query.newzonepayablefee,
    previous_zonepending: req.query.pendingamount,
    previous_zonediscount: req.query.discountamount
  };
  // var queryy1="insert into transport.student_fee values('"+req.query.schoolid+"','"+req.query.studentid+"',(select id from transport.md_zone where zone_name='"+req.query.zonename+"' and school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'),'','',0,0,'"+req.query.fees+"',0,'','','','',(SELECT distinct(start_date) FROM transport.transport_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'),(SELECT distinct(end_date) FROM transport.transport_details WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"'),'Two-Way','"+req.query.updatedby+"',STR_TO_DATE('"+req.query.currdate+"','%Y/%m/%d'),'mapped','','',0,0,'"+req.query.academicyear+"','','','','','','0','0','','','"+req.query.studentname+"',(select admission_status from transport.student_details where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and id='"+req.query.studentid+"' and student_name='"+req.query.studentname+"'))";
  var qur="DELETE FROM transport.student_point where school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'";
  console.log('-------------------------------------------');
  console.log(queryy);
  console.log(qur);
  
  connection.query("UPDATE transport.student_paidfee SET status='changed' WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'",function(err, result){
  if(!err){
  connection.query("UPDATE transport.student_zone_mapping SET status='changed' WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and student_id='"+req.query.studentid+"'",function(err, result){
  if(!err){
  connection.query("INSERT INTO transport.zonechange_master SET ?",[response],function(err, result){
      if(!err)
      {
        if(result.affectedRows>0){
          connection.query(qur,function(err, result){
          res.status(200).json({'returnval': 'Updated!!'});
          });
        } else {
          console.log(err);
          res.status(200).json({'returnval': 'Not Updated!!'});
        }
      }
      else
      {
        console.log(err);
      }
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

app.post('/fetchdistanceseq',  urlencodedParser,function (req,res)
 {  
  
  var qur="SELECT * FROM transport.sequence_bus WHERE school_id='"+req.query.schoolid+"'";
  console.log('--------distance_seq fetch----------');
  console.log(qur);
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

app.post('/newdistance' ,  urlencodedParser,function (req, res)
  {  
    var response={"school_id":req.query.schlidz,
    "id":req.query.distanceid1,"mindistance":req.query.mindistance,"maxdistance":req.query.maxdistance,"fees":req.query.fee,"academic_year":req.query.academic_year}; 
   console.log(response);

    // var qqq="SELECT * FROM transport.md_distance WHERE school_id='"+req.query.schlidz+"' and academic_year='"+req.query.academic_year+"' and id='"+req.query.distanceid1+"' or mindistance='"+req.query.mindistance+"' and maxdistance='"+req.query.maxdistance+"'";
    var qqq="SELECT * FROM transport.md_distance WHERE school_id='"+req.query.schlidz+"' and academic_year='"+req.query.academic_year+"' and id='"+req.query.distanceid1+"'";
     console.log(qqq);
     
    connection.query(qqq,
    function(err, rows)
    {
    if(rows.length==0)
    {
        connection.query("INSERT INTO transport.md_distance SET ?",[response],
          function(err, rows)
          {
            if(!err)
            {
              var tempseq=parseInt((req.query.distanceid1).substring(2))+1;
              console.log(tempseq);
              connection.query("UPDATE transport.sequence_bus  SET distance_seq='"+tempseq+"' where school_id='"+req.query.schlidz+"'", 
                function (err,result)
                {
                  if(result.affectedRows>0)
                    res.status(200).json({'returnval': 'Inserted!'});
              });
            }
              else
              {
              //console.log(err);
              res.status(200).json({'returnval': 'Not Inserted!'});
              }
            });
    }
    else
    {
      res.status(200).json({'returnval': 'Already Exit'});
    }
  });
});

  
  app.post('/fetchzoneseq',  urlencodedParser,function (req,res)
 {  
  
  var qur="SELECT * FROM transport.sequence_bus where school_id='"+req.query.schoolid+"'";
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

  app.post('/fetchzone',  urlencodedParser,function (req, res)
  {
  var qur="SELECT distance_id,zone_name,(select mindistance from transport.md_distance where distance_id=id  and school_id =  '"+req.query.schoolid+"' AND academic_year = '"+req.query.academic_year+"')as min,(select maxdistance from transport.md_distance where distance_id=id  and school_id =  '"+req.query.schoolid+"' AND academic_year =  '"+req.query.academic_year+"')as max,(select fees from transport.md_distance where distance_id=id  and school_id = '"+req.query.schoolid+"' AND academic_year = '"+req.query.academic_year+"')as fee FROM transport.md_zone WHERE school_id = '"+req.query.schoolid+"' AND academic_year = '"+req.query.academic_year+"'and zone_name='"+req.query.zonename1+"'";
  console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
      if(!err)
      {
        if(rows.length>0)
        {
          console.log(JSON.stringify(rows));
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



  app.post('/fnnewzone' ,  urlencodedParser,function (req, res)
  {  
    var response={"school_id":req.query.scholid,
    "id":req.query.zonename1,"distance_id":req.query.distanceid1,"zone_name":req.query.zoneid1,
    "academic_year":req.query.academic_year}; 
    console.log(response);


    var qq1="SELECT school_id,id,zone_name,distance_id,(select id from transport.md_distance where id=distance_id) from transport.md_zone where school_id='"+req.query.scholid+"' and academic_year='"+req.query.academic_year+"' and distance_id='"+req.query.distanceid1+"' and id='"+req.query.zonename1+"' ";

     console.log(qq1);
     

    connection.query(qq1,
    function(err, rows)
    {
    if(rows.length==0)
    {
        connection.query("INSERT INTO transport.md_zone SET ?",[response],
          function(err, rows)
          {
            if(!err)
            {
              var tempseq=parseInt((req.query.zonename1).substring(2))+1;
              connection.query("UPDATE transport.sequence_bus  SET zone_seq='"+tempseq+"',distance_seq='"+tempseq+"' where school_id='"+req.query.scholid+"'", 
                function (err,result)
                {
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
      res.status(200).json({'returnval': 'Already Exit'});
    }
  });
});

app.post('/transport-routing-fetchroute-service' ,  urlencodedParser,function (req, res)
{
      var qur="SELECT * from transport.route where school_id='"+req.query.schlidz+"' and academic_year='"+req.query.academic_year+"'";
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
          res.status(200).json({'returnval': 'invalid'});
          }
        }
       else
      {
         console.log('No data Fetched'+err);
      }
});
});
    
app.post('/transport-routing-routeid' ,  urlencodedParser,function (req, res)
{
  //var p={"id":req.query.id};
    connection.query('select count from transport.sequence',
    function(err, rows){
    if(!err)
    {
      if(rows.length>0)
      {
        //console.log(rows);
      res.status(200).json({'returnval': rows});
      }
      else
      {
      res.status(200).json({'returnval': ''});
      }
    }
    else
    {
      console.log('No data Fetched'+err);
    }

});
});

app.post('/transport-routing-sequence' ,  urlencodedParser,function (req, res)
{
    var id={"id":req.query.id};
    var point={"count":req.query.pointcoun};
      connection.query('update transport.sequence set ?',[point],
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
      res.status(200).json({'returnval': 'invalid'});
      }
    }
    else
    {
      console.log('No data Fetched'+err);
    }
});
});

app.post('/transport-routing-createroute',  urlencodedParser,function (req, res)
{  
 var scho={"school_id":req.query.schol,"id":req.query.id,"route_name":req.query.routes,"academic_year":req.query.academic_year};
   console.log(scho);
 connection.query('select * from transport.route where school_id="'+req.query.schol+'" and academic_year="'+req.query.academic_year+'"  and route_name="'+req.query.routes+'"',
  function(err, rows)
    {
    if(rows.length==0)
    {
      connection.query('insert into transport.route set ?',[scho],
      function(err, rows)
      {

      if(!err)
       {
        // console.log(rows);
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
      res.status(200).json({'returnval': 'Already Exit'});
    }
    });
  });

app.post('/transport-routing-fetchtrip' ,  urlencodedParser,function (req, res)
{
      var qur="SELECT * FROM transport.md_trip";
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
      res.status(200).json({'returnval': 'invalid'});
      }
    }
    else
    {
      console.log('No data Fetched'+err);
    }
});
});

app.post('/transport-routing-getroute' ,  urlencodedParser,function (req, res)
      {
      var schoolx={"school_id":req.query.schol};
      // var qur="select * from transport.route where school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"'";
      connection.query('select * from transport.route where ? and academic_year="'+req.query.academic_year+'"',[schoolx],
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
      res.status(200).json({'returnval': 'invalid'});
      }
      }
      else
      {
      console.log('No data Fetched'+err);
     }
     });
});

app.post('/transport-routing-getroutedetail' ,  urlencodedParser,function (req, res)
{
  var routename={"route_name":req.query.routename};
  var trip={"trip":req.query.tripnos};
  var schoolx={"school_id":req.query.schol};
  //console.log('hello trip...'+trip);
  var query='select * from transport.point where route_id=(select id from transport.route where id="'+req.query.routename+'" and school_id="'+req.query.schol+'" and academic_year="'+req.query.academic_year+'") and trip="'+req.query.tripnos+'" and academic_year="'+req.query.academic_year+'"';
  console.log(query);
  
  connection.query(query,
    function(err, rows){
    if(!err){
      if(rows.length>0)
      {
        // console.log(rows);
        res.status(200).json({'returnval': rows});
      } else {
        res.status(200).json({'returnval': 'invalid'});
      }
    } else{
        console.log('No data Fetched'+err);
      }
    });
});

app.post('/transport-routing-deletemappoint-card',  urlencodedParser,function (req, res)
{
//console.log('come');
  var ptarr=req.query.pointarray;
  var rtname=req.query.routenam;
  var trip1=req.query.tripnum;
  var schoolx={"school_id":req.query.schol};
  //console.log('come'+ptarr);
    connection.query('delete from transport.point where point_name in (?) and trip=? and route_id=(select id from transport.route where route_name=? and ?)',[ptarr,trip1,rtname,schoolx],
        function(err, rows)
        {
    if(!err)
    {
      //console.log('suc');
      res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
});

app.post('/transport-routing-routeid' ,  urlencodedParser,function (req, res)
{
    //var p={"id":req.query.id};
    connection.query('select count from transport.sequence',
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
      res.status(200).json({'returnval': ''});
      }
    }
    else
    {
      console.log('No data Fetched'+err);
    }
});
});

app.post('/transport-routing-sequence' ,  urlencodedParser,function (req, res)
{
    var id={"id":req.query.id};
    var point={"count":req.query.pointcoun};
    connection.query('update transport.sequence set ?',[point],
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
      res.status(200).json({'returnval': 'invalid'});
      }
    }
    else
    {
      console.log('No data Fetched'+err);
    }
});
});

app.post('/transport-routing-insertpoint' ,  urlencodedParser,function (req, res)
{
    var rouname={"id":req.query.id,"point_name":req.query.points,"route_id":req.query.routes,"trip":req.query.trip,"pickup_time":req.query.pick,"drop_time":req.query.drop,"distance_from_school":req.query.distance,"school_id":req.query.schol,"academic_year":req.query.academic_year,"pickup_seq":req.query.pickupseq,"drop_seq":req.query.dropseq};
    //console.log('in server...'+routename);
    //console.log(rouname);
    connection.query('insert into transport.point set ?',[rouname],
    function(err, rows){
    if(!err)
    {
      console.log('inserted');
      res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log("error");
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
});
});

app.post('/transport-routing-fneditthepicuproot-service',  urlencodedParser,function (req, res)
{                              
  console.log("update transport.point set point_name='"+req.query.points+"',distance_from_school='"+req.query.distance+"',pickup_time='"+req.query.picktime+"',drop_time='"+req.query.droptime+"',pickup_seq='"+req.query.pickseq+"',drop_seq='"+req.query.dropseq+"' where school_id='"+req.query.schol+"' and id='"+req.query.pointid+"'and route_id='"+req.query.routid+"' and pickup_seq='"+req.query.pickseq+"' and drop_seq='"+req.query.dropseq+"' and academic_year='"+req.query.academic_year+"'");
  connection.query("update transport.point set point_name='"+req.query.points+"',distance_from_school='"+req.query.distance+"',pickup_time='"+req.query.picktime+"',drop_time='"+req.query.droptime+"',pickup_seq='"+req.query.pickseq+"',drop_seq='"+req.query.dropseq+"' where school_id='"+req.query.schol+"' and id='"+req.query.pointid+"'and route_id='"+req.query.routid+"' and academic_year='"+req.query.academic_year+"'",
    function(err, rows)
    {
    if(!err)
    {    
      //console.log(rows);
      res.status(200).json({'returnval': 'success'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

app.post('/transport-routing-fndeletethepicuproot-service' ,  urlencodedParser,function (req, res)
{  
 
var qur1="DELETE FROM  transport.point where point_name='"+req.query.points+"'and distance_from_school='"+req.query.distance+"' and pickup_time='"+req.query.picktime+"'and drop_time='"+req.query.droptime+"' and school_id='"+req.query.schol+"' and id='"+req.query.pointid+"'and route_id='"+req.query.routid+"' and  pickup_seq='"+req.query.pickseq+"' and drop_seq='"+req.query.dropseq+"' and academic_year='"+req.query.academic_year+"'";
console.log(qur1);
connection.query('select * from transport.student_point where school_id="'+req.query.schol+'" and academic_year="'+req.query.academic_year+'" and drop_point="'+req.query.pointid+'" or pickup_point="'+req.query.pointid+'"',
  function(err, rows)
    {
    if(rows.length==0)
    {
      connection.query(qur1,
      function(err, rows)
      {

      if(!err)
       {
        //console.log(rows);
        res.status(200).json({'returnval': 'delete'});
        }
      else 
      {
        console.log(err);
        res.status(200).json({'returnval': 'Not delete!'});
      }
    });
    }
    else
    {
      res.status(200).json({'returnval': 'notempty'});
    }     
    });
  });

app.post('/transport-routing-selectclass',  urlencodedParser,function (req, res)
{  
   var schoolx={"school_id":req.query.schol};  
    console.log("SELECT distinct class,(select trip from transport.trip_to_grade where grade_name=class and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"')as tripidz from transport.student_details where school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"'");
    connection.query("SELECT distinct(class),(select trip from transport.trip_to_grade where grade_name=class and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"')as tripidz from transport.student_details where school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' order by class",
    function(err, rows){
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      res.status(200).json({'returnval': 'invalid'});
    }
  }
});
});

app.post('/transport-routing-selectnameforpoint',  urlencodedParser,function (req, res)
{ 
    var query1="SELECT distinct s.id, s.student_name ,s.class,(select trip from transport.trip_to_grade where grade_name=s.class and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"')as tripidz from transport.student_details s join transport.student_paidfee f on(s.id=f.student_id) "+
    " WHERE s.school_id='"+req.query.schol+"' and f.school_id='"+req.query.schol+"' and  s.academic_year='"+req.query.academic_year+"' and "+
    " f.academic_year='"+req.query.academic_year+"' and f.installment_amount>0 and f.paid_status not in('bounced','cancelled')";
    var query2="select student_id from transport.student_point where school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"'";
    console.log("--------student point-------");
    console.log(query1);
    console.log(query2);
    console.log("---------------------------");
    var studarr=[];
    connection.query(query1,function(err, rows) {
    if(!err)
    {
    if(rows.length>0)
    {
      studarr=rows;
      connection.query(query2,function(err, rows) {
      if(!err){
      res.status(200).json({'studarr':studarr,'returnval': rows});
      }
      });
    }
    else
    {
      res.status(200).json({'returnval': 'invalid'});
    }
  }
});
});

app.post('/transport-routing-namepick',  urlencodedParser,function (req, res)
{
  var id={"id":req.query.id};
  var req1={"transport_required":'yes'};
  var schoolx={"school_id":req.query.schol};
  var academic_year={"academic_year":req.query.academic_year};
  var qur1='select id , student_name, school_type from transport.student_details where  ? and ? and ? and id in(select student_id from transport.student_paidfee where academic_year="'+req.query.academic_year+'" and school_id="'+req.query.schol+'" and student_id="'+req.query.id+'")';
    connection.query("select id , student_name, school_type from transport.student_details where  ? and ? and ? and id in(select student_id from transport.student_paidfee where installment_amount>0 and paid_status not in('bounced','cancelled') and academic_year='"+req.query.academic_year+"' and school_id='"+req.query.schol+"' and student_id='"+req.query.id+"')",[id,schoolx,academic_year],
    function(err, rows){
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
      //console.log(rows);
    }
    else
    {
      res.status(200).json({'returnval': ''});
      console.log('Not returing anything');
    }
  }
});
});

app.post('/transport-routing-classpick',  urlencodedParser,function (req, res)
{
  var schoolx={"school_id":req.query.schol};
  var class_id={"class":req.query.classes};
  var academic_year={"academic_year":req.query.academic_year};

// var queryy="select id , student_name, class from transport.student_details  where id in(select student_id from transport.student_paidfee where installment_amount>0 and paid_status not in('') and school_id="'+req.query.schol+'" and academic_year="'+req.query.academic_year+'") and id not in (Select student_id from transport.student_point where school_id="'+req.query.schol+'" and academic_year="'+req.query.academic_year+'") and class="'+req.query.classes+'" and school_id="'+req.query.schol+'" and academic_year="'+req.query.academic_year+'"';
var qur1="select distinct s.id , s.student_name, s.class from transport.student_details s join transport.student_paidfee f on(s.id=f.student_id) "+
" where s.school_id='"+req.query.schol+"' and f.school_id='"+req.query.schol+"' and s.academic_year='"+req.query.academic_year+"' and "+
" f.academic_year='"+req.query.academic_year+"' and f.installment_amount>0 and paid_status not in('bounced','cancelled') and s.class='"+req.query.classes+"' ";
var qur2="select student_id from transport.student_point where school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"'";
console.log("+++++++++selecting student++++++++++");
console.log(qur1);
console.log(qur2);
console.log("==========");
    var studarr=[]; 
    connection.query(qur1,function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      studarr=rows;
      connection.query(qur2,function(err, rows){
      if(!err)
      res.status(200).json({'studarr':studarr,'returnval': rows});
      });
    }
    else
    {
      res.status(200).json({'returnval': ''});
    }
  }
});
});

app.post('/transport-routing-submiturl',  urlencodedParser,function (req, res)
{
    var mappointtostudent={"student_id":req.query.studentid,"school_type":req.query.class_id,"pickup_route_id":req.query.pickroute,"pickup_point":req.query.pickpoint,"drop_route_id":req.query.droproute, "drop_point":req.query.droppoint,"flag":req.query.flag,"school_id":req.query.schol,"academic_year":req.query.academic_year};
    //console.log(mappointtostudent);
    connection.query('insert into transport.student_point set ?',[mappointtostudent],
    function(err, rows){
    if(!err)
    {
      res.status(200).json({'returnval': 'success'});
    }
    else
    {
      //console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
});
});

app.post('/transport-routing-routepoint',  urlencodedParser,function (req, res)
{
      var schoolx={"school_id":req.query.schol};
      var academicyear={"academic_year":req.query.academic_year};
      connection.query('SELECT * from transport.route where ? and ?',[schoolx,academicyear],
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
          res.status(200).json({'returnval': 'invalid'});
        }
      }
});
});

app.post('/transport-routing-pickpoints',  urlencodedParser,function (req, res)
{
    var route_id=req.query.routedroppt;
    var studid=req.query.studid;
    var schoolx=req.query.schol;
    var trip=req.query.schooltype;
    var academic_year=req.query.academic_year;
    var qur1='SELECT id, point_name from transport.point where route_id="'+req.query.routept+'" and school_id="'+req.query.schol+'" and distance_from_school <= (select maxdistance from transport.md_distance where id=(select distance_id from transport.md_zone where school_id="'+req.query.schol+'" and academic_year="'+req.query.academic_year+'" and  id=(select zone_id from transport.student_zone_mapping where student_id="'+req.query.studid+'"  and school_id="'+req.query.schol+'" and academic_year="'+req.query.academic_year+'" and status="mapped") and school_id="'+req.query.schol+'") and school_id="'+req.query.schol+'" and academic_year="'+req.query.academic_year+'")';
    console.log('--------------pick points-------------');
    console.log(qur1);
    connection.query(qur1,function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      res.status(200).json({'returnval': 'invalid'});
    }
  }
  else
  {
    console.log(err);
  }
});
});

app.post('/transport-routing-routedroppoint',  urlencodedParser,function (req, res)
{
    var route_id=req.query.routedroppt;
    var studid=req.query.studid;
    var trip=req.query.schooltype;
    var schoolx=req.query.schol;
    var academic_year=req.query.academic_year;
   
 var qur1="SELECT id, point_name from transport.point where route_id='"+req.query.routedroppt+"' and school_id='"+req.query.schol+"' and distance_from_school <= (select maxdistance from transport.md_distance where id=(select distance_id from transport.md_zone where school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and  id=(select zone_id from transport.student_zone_mapping where student_id='"+req.query.studid+"'  and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and status='mapped') and school_id='"+req.query.schol+"') and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' )";

 console.log("************");
 console.log(qur1);
        connection.query(qur1,
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
          res.status(200).json({'returnval': 'invalid'});
        }
      }
});
});

app.post('/transport-routing-chprevpick',  urlencodedParser,function (req, res)
{
  var id={"student_id":req.query.studentid};
  var schoolx={"school_id":req.query.schol};
  var academicyear={"academic_year":req.query.academic_year};
  console.log(req.query.schol);
     connection.query('select * from transport.student_point where ? and ? and ?',[id,schoolx,academicyear],
     function(err, rows)
      {
        if(!err)
        {
        if(rows.length>0)
        {
          res.status(200).json({'returnval': rows});
          console.log(rows);
        }
        else
        {
          res.status(200).json({'returnval': ''});
        }
      }
      else
      {
        console.log(err);
      }

});
});

app.post('/transport-routing-selectnameforchpoint',  urlencodedParser,function (req, res)
{ 
    var query1="SELECT s.id, s.student_name ,s.class,(select trip from transport.trip_to_grade where grade_name=s.class and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"')as tripidz from transport.student_details s join transport.student_paidfee f on(s.id=f.student_id) "+
    " WHERE s.school_id='"+req.query.schol+"' and f.school_id='"+req.query.schol+"' and  s.academic_year='"+req.query.academic_year+"' and "+
    " f.academic_year='"+req.query.academic_year+"' and f.installment_amount>0 and f.paid_status not in('bounced','cancelled') ";
    var query2="select student_id from transport.student_point where school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"'";
    var studarr=[];
    connection.query(query1,function(err, rows) {
    if(!err)
    {
    if(rows.length>0)
    {
      studarr=rows;
      connection.query(query2,function(err, rows) {
      if(!err){
      res.status(200).json({'studarr':studarr,'returnval': rows});
      }
      });
    }
    else
    {
      res.status(200).json({'returnval': 'invalid'});
    }
  }
});
  });

app.post('/transport-routing-chnamepick',  urlencodedParser,function (req, res)
{
  var id={"id":req.query.id};
  var req1={"transport_required":'yes'};
  var schoolx={"school_id":req.query.schol};
  var academicyear={"academic_year":req.query.academic_year};
  console.log(req.query.schol);
    connection.query('select id , student_name, school_type from transport.student_details where  ? and ? and ? and ?',[id,req1,schoolx,academicyear],
    function(err, rows){
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
      console.log(rows);
    }
    else
    {
      res.status(200).json({'returnval': ''});
    }
  }
  else
  {
    console.log(err);
  }

});
  });

app.post('/transport-routing-submitupdateurl',  urlencodedParser,function (req, res)
{
     var studentid={"student_id":req.query.studentid};
     var pickroute={"pickup_route_id":req.query.pickroute};
     var pickpoint={"pickup_point":req.query.pickpoint};
     var droproute={"drop_route_id":req.query.droproute};
     var droppoint= {"drop_point":req.query.droppoint};
     var schol={"school_id":req.query.schol};
     var academicyear={"academic_year":req.query.academic_year};
     connection.query('update transport.student_point set ?,?,?,? where ? and ? and ?',[pickroute,pickpoint,droproute,droppoint,studentid,schol,academicyear],
     function(err, rows){
    if(!err)
    {
      console.log(rows);
      res.status(200).json({'returnval': 'success'});
    }
    else
    {
      //console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }

});
});

app.post('/transport-routing-deletepoint-service',  urlencodedParser,function (req, res)
{
    var qur1="DELETE FROM transport.student_point where student_id='"+req.query.stid+"' and school_id='"+req.query.scholid+"' and academic_year='"+req.query.academic_year+"'";
    console.log(qur1);
      connection.query(qur1,
      function(err, rows)
      {
        if(!err)
        {
          console.log(rows);
          res.status(200).json({'returnval': 'success'});
        }
        else
        {
          //console.log(err);
          res.status(200).json({'returnval': 'invalid'});
        }
});
});

app.post('/transport-routing-generateroutereport',  urlencodedParser,function (req, res)
{
  var schoolx={"school_id":req.query.schol};
  connection.query('SELECT * from transport.route  where ? and academic_year="'+req.query.academic_year+'"',[schoolx],
  function(err, rows){
    if(!err)
    {
    if(rows.length>0)
    {
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

app.post('/transport-routing-route-report-card',  urlencodedParser,function (req, res)
{
  var route_id={"route_id":req.query.routeid};
  var schoolx={"school_id":req.query.schol};
    connection.query('SELECT p.route_id, p.point_name, p.pickup_time, p.drop_time,p.trip, r.route_name from transport.point p left join transport.route r on p.route_id=r.id where ? and ?',[route_id,schoolx],
    function(err, rows){
    if(!err){
      if(rows.length>0){
        //console.log(rows);
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'invalid'});
      }
    } else {
      console.log(err);
    }
  });
});

app.post('/transport-routing-studentpickroute-report-card',  urlencodedParser,function (req, res){
  var tripid={"school_type":req.query.tripid};
  var schoolx={"school_id":req.query.schol};
  var route_id={"pickup_route_id":req.query.routeid};
  var query="SELECT p.student_id,(select student_name from transport.student_details where id=p.student_id and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"')as name ,(select class from transport.student_details where id=p.student_id and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as std,(select m.mobile from mlzscrm.parent m where student_id=p.student_id and m.school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as mobile,(select parent_name from mlzscrm.parent where student_id=p.student_id and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as pname, (select point_name from transport.point where id=p.pickup_point and academic_year='"+req.query.academic_year+"' and school_id='"+req.query.schol+"') as pick from transport.student_point p where p.pickup_route_id='"+req.query.routeid+"' and p.school_type='"+req.query.tripid+"' and p.school_id='"+req.query.schol+"' and p.academic_year='"+req.query.academic_year+"'";
   console.log("tripid...."+req.query.tripid); 
   console.log(query);
    connection.query(query,
    function(err, rows){
    if(!err){
      if(rows.length>0){
        //console.log(rows);
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'empty'});
      }
    } else {
      console.log(err);
    }
  });
});

app.post('/transport-routing-studentdroproute-report-card',  urlencodedParser,function (req, res)
{
  var tripid={"school_type":req.query.tripid};
  var schoolx={"school_id":req.query.schol};
  console.log('tripid...'+req.query.tripid);
  var route_id={"drop_route_id":req.query.routeid};

    connection.query("SELECT p.student_id,(select student_name from transport.student_details where id=p.student_id and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"')as name ,(select class from transport.student_details where id=p.student_id and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as std,(select m.mobile from mlzscrm.parent m where student_id=p.student_id and m.school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as mobile,(select parent_name from  mlzscrm.parent where student_id=p.student_id and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as pname, (select point_name from transport.point where id=p.drop_point and academic_year='"+req.query.academic_year+"' and school_id='"+req.query.schol+"') as pick from transport.student_point p where p.drop_route_id='"+req.query.routeid+"' and p.school_type='"+req.query.tripid+"' and p.school_id='"+req.query.schol+"' and p.academic_year='"+req.query.academic_year+"'",
    function(err, rows){
    if(!err){
      if(rows.length>0){
        res.status(200).json({'returnval': rows});
      } else {
        res.status(200).json({'returnval': ''});
      }
    } else {
      console.log(err);
    }
  });
});

app.post('/transport-routing-gradewisepickroute-report-card',  urlencodedParser,function (req, res){
  var tripid={"school_type":req.query.tripid};
  var schoolx={"school_id":req.query.schol};
  var grade = {"class":req.query.grade};
  var route_id={"pickup_route_id":req.query.routeid};
  // var query="SELECT p.student_id ,(select d.student_name from transport.student_details d where id=p.student_id and d.school_id='"+req.query.schol+"'  and d.academic_year='"+req.query.academic_year+"')as name,(select zone_name from transport.md_zone where id =(select f.zone_id from transport.student_paidfee f where student_id=p.student_id and f.school_id='"+req.query.schol+"' and f.academic_year='"+req.query.academic_year+"') and school_id='"+req.query.schol+"'  and academic_year='"+req.query.academic_year+"')as zone,(select m.mobile from mlzscrm.parent m where student_id=p.student_id and m.school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as mobile ,(select d.class from transport.student_details d where d.id=p.student_id and d.school_id='"+req.query.schol+"'  and d.academic_year='"+req.query.academic_year+"' and p.school_id='"+req.query.schol+"'  and p.academic_year='"+req.query.academic_year+"') as std ,(select parent_name from mlzscrm.parent where student_id=p.student_id and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as pname,(select point_name from transport.point where id=p.drop_point and school_id='"+req.query.schol+"'  and academic_year='"+req.query.academic_year+"' and route_id='"+req.query.routeid+"') as pick, (select point_name from transport.point where id=p.pickup_point and academic_year='"+req.query.academic_year+"' and school_id='"+req.query.schol+"'  and route_id='"+req.query.routeid+"' ) as dropid from transport.student_point p where  p.school_type='"+req.query.tripid+"'  and p.school_id='"+req.query.schol+"'   and  p.academic_year='"+req.query.academic_year+"' and student_id in (select id from transport.student_details where class='"+req.query.grade+"' and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"')  and (p.pickup_route_id='"+req.query.routeid+"' or p.drop_route_id='"+req.query.routeid+"')";
  var query="SELECT distinct f.student_id,f.student_name,f.zone_name,f.grade, "+
" (SELECT parent_name FROM transport.parent WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" student_id=f.student_id) as parent, "+
" (SELECT mobile FROM transport.parent WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" student_id=f.student_id) as mobile, "+
" (SELECT route_name FROM transport.route WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" id=p.pickup_route_id) as pickroute, "+
" (SELECT point_name FROM transport.point WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" id=p.pickup_point) as pickpoint, "+
" (SELECT route_name FROM transport.route WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" id=p.drop_route_id) as droproute, "+
" (SELECT point_name FROM transport.point WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" id=p.drop_point) as droppoint "+
" FROM transport.student_point p join transport.student_paidfee f "+
" on(f.student_id=p.student_id)  where p.school_id=f.school_id and p.academic_year=f.academic_year  and "+
" p.school_type='"+req.query.tripid+"' and p.academic_year='"+req.query.academic_year+"' and p.school_id='"+req.query.schol+"' and f.academic_year='"+req.query.academic_year+"' and f.school_id='"+req.query.schol+"' and f.grade='"+req.query.grade+"' and p.pickup_route_id='"+req.query.routeid+"'";
  console.log(query);
    connection.query(query,
    function(err, rows){
    if(!err){
      if(rows.length>0){
        //console.log(rows);
        res.status(200).json({'returnval': rows});
      } else {
        console.log(err);
        res.status(200).json({'returnval': 'empty'});
      }
    } 
    else {
      console.log(err);
    }
  });
});

app.post('/transport-routing-gradewisedroproute-report-card',  urlencodedParser,function (req, res){
  var tripid={"school_type":req.query.tripid};
  var schoolx={"school_id":req.query.schol};
  var grade = {"class":req.query.grade};
  var route_id={"drop_route_id":req.query.routeid};
  // var qur="SELECT p.student_id ,(select  (select first_name from transport.driver where id=driver_id) as driverid from transport.route_bus  where trip='"+req.query.tripid+"'  and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and route_id='"+req.query.routeid+"'  )as drivername,(select  (select first_name from transport.attender where id=attender_id) as attenderid from transport.route_bus  where trip='"+req.query.tripid+"'  and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and route_id='"+req.query.routeid+"'  )as attendername,(select  (select mobile_no from transport.attender where id=attender_id) as attenderid from transport.route_bus  where trip='"+req.query.tripid+"'  and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and route_id='"+req.query.routeid+"')as attendermobile,(select  (select mobile_no from transport.driver where id=driver_id) as mobile from transport.route_bus  where trip='"+req.query.tripid+"'  and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and route_id='"+req.query.routeid+"'  )as drivermobile,(select d.student_name from transport.student_details d where id=p.student_id and d.school_id='"+req.query.schol+"' and d.academic_year='"+req.query.academic_year+"')as name,(select zone_name from transport.md_zone where id =(select f.zone_id from transport.student_paidfee f where student_id=p.student_id and f.school_id='"+req.query.schol+"' and f.academic_year='"+req.query.academic_year+"') and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"')as zone,(select m.mobile from mlzscrm.parent m where student_id=p.student_id and m.school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as mobile ,(select d.class from transport.student_details d where d.id=p.student_id and d.school_id='"+req.query.schol+"' and d.academic_year='"+req.query.academic_year+"') as std ,(select parent_name from mlzscrm.parent where student_id=p.student_id and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as pname,(select point_name from transport.point where id=p.drop_point and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"') as pick from transport.student_point p where p.drop_route_id='"+req.query.routeid+"' and p.school_type='"+req.query.tripid+"' and p.school_id='"+req.query.schol+"'  and  p.academic_year='"+req.query.academic_year+"' and student_id in (select id from transport.student_details where class='"+req.query.grade+"' and school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"')";
  var query="SELECT f.student_id,f.student_name,f.zone_name,f.grade, "+
" (SELECT parent_name FROM transport.parent WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" student_id=f.student_id) as parent, "+
" (SELECT mobile FROM transport.parent WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" student_id=f.student_id) as mobile, "+
" (SELECT route_name FROM transport.route WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" id=p.pickup_route_id) as pickroute, "+
" (SELECT point_name FROM transport.point WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" id=p.pickup_point) as pickpoint, "+
" (SELECT route_name FROM transport.route WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" id=p.drop_route_id) as droproute, "+
" (SELECT point_name FROM transport.point WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and "+
" id=p.drop_point) as droppoint "+
" FROM transport.student_point p join transport.student_paidfee f "+
" on(f.student_id=p.student_id)  where p.school_id=f.school_id and p.academic_year=f.academic_year  and "+
" p.school_type='"+req.query.tripid+"' and f.academic_year='"+req.query.academic_year+"' and f.school_id='"+req.query.schol+"' and f.grade='"+req.query.grade+"' and p.drop_route_id='"+req.query.routeid+"'";

  connection.query(qur,function(err, rows){
    if(!err){
      if(rows.length>0){
        res.status(200).json({'returnval': rows});
      } else {
        res.status(200).json({'returnval': 'empty'});
      }
    } else {
      console.log(err);
    }
  });
});

app.post('/transport-routing-getgrade',  urlencodedParser,function (req, res){
  var schoolx={"school_id":req.query.schol};
  console.log(schoolx);
    connection.query('select distinct(class) from transport.class_details where ?',[schoolx],
    function(err, rows){
    if(!err){
      res.status(200).json({'returnval': rows});
    } else {
      console.log(err);
    }
  });
});


app.post('/transport-routing-triptograde',  urlencodedParser,function (req, res){
  var schoolx={"school_id":req.query.schol};
  console.log(schoolx);
  var response={
    school_id:req.query.schol,
    academic_year:req.query.academic_year,
    grade_name:req.query.grade,
    trip:req.query.trip
  };
  var qur1="SELECT * FROM transport.trip_to_grade WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and grade_name=(select grade_name from grade_master where grade_id='"+req.query.grade+"')";
  var qur2="INSERT INTO transport.trip_to_grade values('"+req.query.schol+"','"+req.query.academic_year+"',(select grade_name from grade_master where grade_id='"+req.query.grade+"'),'"+req.query.trip+"')";
  var qur3="UPDATE transport.trip_to_grade SET trip='"+req.query.trip+"' WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"' and grade_name=(select grade_name from grade_master where grade_id='"+req.query.grade+"')"
  connection.query(qur1,function(err, rows){
    if(!err){
      if(rows.length>0){
        connection.query(qur3,function(err, rows){
          if(!err)
          res.status(200).json({'returnval': 'updated'});
          else
            console.log(err);
        });
      }
      else{
        connection.query(qur2,function(err, rows){
          if(!err)
          res.status(200).json({'returnval': 'updated'});
          else
            console.log(err);
        });
      }
      // res.status(200).json({'returnval': rows});
    } else {
      console.log(err);
    }
  });
});

app.post('/transport-routing-fetchtripgrade',  urlencodedParser,function (req, res){
    connection.query("SELECT * FROM transport.trip_to_grade WHERE school_id='"+req.query.schol+"' and academic_year='"+req.query.academic_year+"'",
    function(err, rows){
    if(!err){
      res.status(200).json({'returnval': rows});
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
