var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');//express 4.0以上将session 和cookie中间件分开
var logger = require('morgan');
var MongoStore = require('connect-mongo')(session);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("%@yqf$*/!+-"));
app.use(express.static(path.join(__dirname, 'public')));
/**
 * @package cookie-session
 * secet:"" 签名(伪加密)
 * resave :
 * saveUninitialized:true;
 * **/
//配置session中间件
app.use(session({
    secret:"yqf",//签名(伪加密 随便写，使用自带方法加密)
    name:"session_id",//保存在本地cookies的名字 默认为connect_sid
    resave:false,//true ：强制保存session 即使没变化 false:不强制保存
    saveUninitialized:true,//强制将未初始化的session存储
    rolling:true,//有操作重新计算时间
    cookie:{
        maxAge:50000,
        httpOnly:true
    },
    store:new MongoStore({
        secret: 'yqf',//签名
        url:"mongodb://127.0.0.1:27017/student",//数据库地址
        touchAfter:24*5000//在指定时间内,只要session内容不变，就会延迟更新通过这样做，设置touchAfter: 24 * 3600你说会话只在24小时内更新一次，无论发生多少请求（除了那些改变会话数据的东西）
    })

}));
//路由设置
app.use('/', indexRouter);
app.use('/users', usersRouter);
/***
 * @package cookie
 * domain:".yqf.com"  二级域名 cookies 共享
 * path  :url  指定目录下使用cookis
 * httponly:true  只能在服务器端设置cookies  客户端无法通过js获取cookies的值 document.cookies无法获取值
 * signed 设置cookieParser("加密数据标识")
 * */
app.get('/getCookies',function (req,res) {
    console.log(req.signedCookies.citys);
    res.send("你浏览过的城市为-"+req.signedCookies.citys);
});
app.get('/setCookies',function (req,res) {
    //获取数据
    var city = req.query.city;
//  获取缓存Cookies数据
    var citys = req.signedCookies.citys;
//  设置cookis
    if(citys){//判断是否存在Cookies
        var reSign = false;
        citys.forEach(function (value,index) {
            if(value==city){//判断是否重复
                reSign = true;
                return;
            }
        });
        if (!reSign) {//如果Cookies不重复，数据追加
            citys.push(city);
        }
    }else {
        //判断是否为第一次缓存Cookies
        citys = [];
        citys.push(city);
    }
    res.cookie("citys",citys,{maxAge:5000, domain:'.yqf.com',httpOnly:true,signed:true});
    res.send("你浏览过的城市为——"+city);

});
app.get('/index',function (req,res) {
    console.log(req.session.userName);
    if(req.session.userName){
        res.send("欢迎再次回来"+req.session.userName);
    }else{
        res.send("未登录");
    }

});
//登录
app.get('/login',function (req,res) {
//     设置session 信息
    req.session.userName = "yqf";
    res.send("登录成功");
});
//退出 销毁session
app.use('/logOut',function (req,res) {
    req.session.cookie.maxAge = 0;//销毁session登录信息
    res.send("退出登录")
});
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8080,function () {
  console.log("port is 8080");
})
// module.exports = app;
