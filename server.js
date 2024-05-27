const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

let db;
const url =
  "mongodb+srv://admin:as123123@kpkpkp.cau2nx4.mongodb.net/?retryWrites=true&w=majority&appName=kpkpkp";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");
    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 서버 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html");
});

app.get("/about", (요청, 응답) => {
  응답.sendFile(__dirname + "/about.html");
});

app.get("/news", (요청, 응답) => {
  db.collection("post").insertOne({ title: "어쩌구" });
  응답.send("오늘 비 옴");
});

app.get("/shop", (요청, 응답) => {
  응답.send("쇼핑 페이지임");
});

app.get("/list", async (요청, 응답) => {
  try {
    let result = await db.collection("post").find().toArray();
    응답.render("list.ejs", { 글목록: result });
  } catch (error) {
    console.error(error);
    응답.status(500).send("데이터를 불러오는 중 오류가 발생했습니다.");
  }
});

app.get("/time", async (요청, 응답) => {
  try {
    let time = new Date();
    console.log(time);
    응답.render("time.ejs", { 시간: time });
  } catch (error) {
    console.error(error);
    응답.status(500).send("데이터를 불러오는 중 오류가 발생했습니다.");
  }
});

app.get("/add", async (요청, 응답) => {
  응답.render("add.ejs");
});

app.post("/add", async (요청, 응답) => {
  if (요청.body.title == "") {
    응답.send("제목안적었는데");
  } else {
    await db
      .collection("post")
      .insertOne({ title: 요청.body.title, content: 요청.body.content });
    // console.log(요청.body);
    응답.redirect("/list");
  }
});

app.get("/detail/:id", async (요청, 응답) => {
  let result = await db
    .collection("post")
    .findOne({ _id: new ObjectId(요청.params.id) });
  응답.render("detail.ejs", { result: result });
});

app.get("/update/:id", async (요청, 응답) => {
  let result = await db
    .collection("post")
    .findOne({ _id: new ObjectId(요청.params.id) });
  응답.render("update.ejs", { result: result });
});

app.post("/update", async (요청, 응답) => {
  await db
    .collection("post")
    .updateOne(
      { _id: new ObjectId(요청.body.id) },
      { $set: { title: 요청.body.title, content: 요청.body.content } }
    );
  응답.redirect("/list");
});

app.delete("/delete", async (요청, 응답) => {
  let result = await db
    .collection("post")
    .deleteOne({ _id: new ObjectId(요청.query.docid) });
  응답.send("삭제완료");
});
