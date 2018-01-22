function showModal(header, body){
  $('.modal').modal();
  $("#modal-header").html(header);
  $("#modal-body").html(body);
  $('.modal').modal('open');
}
function hideModal(){
  $('.modal').modal('close');
}
paragraphs = [

    "friends and family have to say first.\n" +
    "\n" +
    "In short, you’ll see more posts from friends that have sparked lively debates in the comments. And you’ll see fewer cooking videos from brands and publications. Prioritizing what your friends and family share is part of an effort by Facebook to help people spend time on the site in what it thinks is a more meaningful way.\n" +
    "\n" +
    "Facebook is making the changes by tinkering under the hood, reconfiguring its algorithms that guess what you may be most interested in. Here’s what it means for you.\n" +
    "\n" +
    "Publishers and brands are the losers.\n" +
    "Facebook is not being coy about this: Those third-party organizations that took over large swaths of your News Feed years ago — sites that post funny pictures and memes, sell you clothing, or deliver articles about the world — will have the visibility of their posts scaled back under the new arrangement.\n" +
    "\n" +
    "In a post on the company’s blog Thursday, the head of its News Feed team, Adam Mosseri, wrote that showing more posts from friends and family “means we’ll show less public content, including videos and other posts from publishers or businesses.”"

];

TypingTestComponent = Vue.component('typing-test-template',{
  template: "#typing-test-template",
  data: function(){
    return {
      loading: false,
      typedWord: "",
      typedWords: [],
      paragraphHTML: "",
      processed_words: "",
      unprocessed_words: "",
      paragraph: paragraphs[Math.floor(Math.random() * paragraphs.length)].replace(/\n|\r/g, " ").replace(/ +(?= )/g,''),
      correct: 0,
      incorrect: 0,
      character_pressed: 0,
      first: true,
      time: 3,
      remaining_time: 0,
      passed_time: 0,
      wpm: 0,
      prevScrollOffset: 0,
      result: {
        announced: false,
        correct_words: [],
        incorrect_words: [],
        total_characters: 0,
        correct_characters: 0,
        incorrect_characters: 0,
        accuracy: 0,
        wpm: 0
      }
    }

  },
  watch: {
    typedWord: function () {
      if(this.typedWord[this.typedWord.length - 1] == " "){
        this.typedWords.push(this.typedWord.replace(" ", ""));
        this.typedWord = "";
        var typed_array = this.typedWords;
        if(typed_array.length <= this.unprocessed_words.length){
          var typed_word = typed_array[typed_array.length-1];
          this.character_pressed += typed_word.length+1;

          if(typed_word == this.unprocessed_words[typed_array.length -1]){
            this.correct += 1;
            this.result.correct_words.push(typed_word);
            if(typed_array.length < this.unprocessed_words.length){
              var next_word = "<span id='spangrey' class='grey lighten-2'>"+this.unprocessed_words[typed_array.length]+"</span>";
              this.processed_words[typed_array.length] = next_word;
            }
            var word = "<span style='color:green'>"+this.unprocessed_words[typed_array.length -1]+"</span>";
            this.processed_words[typed_array.length-1] = word;
            this.paragraphHTML = this.processed_words.join(" ");
          }else{
            this.incorrect += 1;
            this.result.incorrect_words.push(typed_word);
            if(typed_array.length < this.unprocessed_words.length){
              var next_word = "<span id='spangrey' class='grey lighten-2'>"+this.unprocessed_words[typed_array.length]+"</span>";
              this.processed_words[typed_array.length] = next_word;
            }
            var word = "<span  style='color:red'>"+this.unprocessed_words[typed_array.length -1]+"</span>";
            this.processed_words[typed_array.length-1] = word;
            this.paragraphHTML = this.processed_words.join(" ");
          }

          var containerOffset = Math.floor($(".typing-paragraph").offset().top + $(".typing-paragraph").height());
          if($("span.grey").offset().top >= containerOffset - 100){
            $(".typing-paragraph").animate({scrollTop: document.getElementsByClassName("typing-paragraph")[0].scrollTop + 72},300);
          }
        }
      }
    }
  },
  methods: {
    getLogin: function(){
      return localStorage.getItem("_logindetails") ? localStorage.getItem("_logindetails") : false;
    },
    saveResult: function(){
      this.loading = true;
      if(this.getLogin()
          && JSON.parse(this.getLogin()).tested == 0
          || JSON.parse(this.getLogin()).allow_retest == 1
        ){
        this.result.total_words_typed = this.result.correct_words.join(" ")+this.result.incorrect_words.join(" ");
        this.result.time = this.time * 60;
        this.result.time = (Math.floor(this.result.time/60).toFixed())+":"+this.pad((this.result.time % 60).toFixed());
        this.result.uid = JSON.parse(this.getLogin()).id;
        this.$http.post("./api_backend/save_result.php", JSON.stringify({result: this.result}))
            .then(response => {
              this.loading = false;
              localStorage.removeItem("_logindetails");
        });
      }
    },
    pad: function(d){
      return (d < 10) ? '0' + d.toString() : d.toString();
    },
    highlightFirstWord: function(){
      var next_word = "<span id='spangrey' class='grey lighten-2'>"+this.unprocessed_words[this.typedWords.length]+"</span>";
      this.processed_words[this.typedWords.length] = next_word;
    },
    init: function () {
      if(this.first){
        if(this.typedWord.length != 0){
          this.first = false;
          _this = this;

          var intr = setInterval(function(){
            _this.remaining_time = _this.remaining_time - 1;
            _this.passed_time = (_this.time * 60) - _this.remaining_time;
            _this.result.correct_characters = _this.result.correct_words.join(" ").length;
            _this.wpm = ((_this.character_pressed / 5) + _this.result.incorrect_words.length) / (_this.passed_time / 60);
            _this.result.total_characters = _this.character_pressed;
            _this.result.correct_characters = _this.result.correct_words.join(" ").length;
            _this.result.incorrect_characters = _this.result.incorrect_words.join(" ").length;
            _this.result.wpm = (((_this.character_pressed / 5) + _this.result.incorrect_words.length) / _this.time).toFixed();
            _this.result.accuracy = Math.floor((_this.result.correct_characters / _this.result.total_characters)*100);
            if(_this.remaining_time <= 0) {
              clearInterval(intr);
              _this.result.announced = true;
              _this.saveResult();
            }
          }, 1000);
        }
      }
    }
  },
  mounted: function(){
    if(!this.getLogin())
      this.$router.push("/login");
    $("body").removeClass("grey lighten-4");
    $("body").addClass("grey lighten-4");
    this.remaining_time = this.time * 60;
    this.processed_words = this.paragraph.split(" ");
    this.unprocessed_words = this.paragraph.split(" ");
    this.highlightFirstWord();
    this.paragraphHTML = this.processed_words.join(" ");
    $("input[type='text']").on('cut copy paste drop', function () {
      return false;
    });
    setTimeout(function(){
      if($(".typing-paragraph").height() > 200){
        $(".typing-paragraph").css({overflowY: "scroll", height: "200px"});
      }
    },1);

  }
});

LoginComponent = Vue.component('login-template', {
  template: "#login-template",
  data: function(){
    return {
      email: '',
      password: '',
      loading: false
    }
  },
  methods:{
    getLogin: function(){
      return localStorage.getItem("_logindetails") ? localStorage.getItem("_logindetails") : false;
    },
    login: function(){
      this.loading = true;
      if(this.email == "" || this.password == ""){
        showModal("Wait !", "Please Fill In The Form Correctly !");
        this.loading = false;
      }else if(isNaN(this.email) || this.email.length != 13){
        showModal("Wait !", "The Cnic You Entered Is Not Valid !");
        this.loading = false;
      }else if(isNaN(this.password)){
         showModal("Wait !", "The Roll Number You Entered Is Not Valid !");
      }else {
        this.$http.post("./api_backend/login.php", JSON.stringify({cnic: this.email, rollno: this.password}))
            .then(response => {
            this.loading = false;
          if(response.body == "notfound"){
            showModal("Can't Login !", "No User Name Exists With Email And Password You Provided");
          }else{
            var userlogin = response.body.user;
            if(userlogin.tested == '0' || userlogin.allow_retest == '1') {
              localStorage.setItem("_logindetails", JSON.stringify(response.body.user));
              this.$router.push("/typing-test");
            }else{
              showModal("Can't Login !", "You're already being tested");
            }
          }
        });
      }
    }
  },
  mounted: function(){
    if(this.getLogin()){
      this.$router.push("/typing-test");
    }
    $("body").removeClass("grey lighten-4");
    $("body").addClass("grey lighten-4");
  }
});

var router = new VueRouter(
    {
        mode: 'history',
        routes: [
          {path: '', component: LoginComponent},
          {path: '/typing-test', component: TypingTestComponent},
          {path: '/login', component: LoginComponent}
        ]
    }
);

var app = new Vue({
    el: '#typing-application',
    router: router
});