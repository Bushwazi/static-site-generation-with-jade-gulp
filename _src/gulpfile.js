var fs = require('fs'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    jade = require('gulp-jade'),
    rename = require("gulp-rename"),
    // above, just your standard set of module requirements
    // below, setting up some Regular Expressions
    titleRegExp = /var title \=(.*?)\n/g,
    catRegExp = /var categories \=(.*?)\n/g,
    descriptionRegExp = /var description \=(.*?)\n/g,
    publishDateRegExp = /var publish_date \=(.*?)\n/g,
    // variable initializing
    fileName = null,
    pageTitle = null,
    pageCategories = null,
    // starting to Javascript objects to store data
    blogPostJson = new Object(),
    blogCategoryJson = new Object(),
    currentFile = null,
    postCounter = null,
    // an array that has the name of each page we want in the navigation
    websiteLinks = ['HOME','ABOUT','RESUME','BLOG','CONTACT'];

gulp.task('html', function() {
	postCounter = 0;
  fs.readdir("./markup/blog", function(err,files){
  	/*
  		READ THE DIRECTORY WITH THE BLOG POSTS
  	*/
  	// console.log("READ DIRECTORY\n", files);
  	if (err) throw err;
  	buildBlogData(files);
  });
  var buildBlogData = function(data){
  	/*
  		CONVERT THE DATA RETURNED FROM READIN THE DIRECTORY INTO JSON IN MEMORY
  	*/
  	// console.log("START: buildBlogData\n", data);
    data.map(function(url, ind, arr){
    	// console.log("START MAP"); 
      // if the page is jade and is not the index or category page
      if(url.indexOf(".jade") > 0 && url.indexOf("index") < 0 && url.indexOf("category") < 0){
      	currentFile = fs.readFileSync("./markup/blog/" + url, 'utf8');
      	fileName = url;
				pageTitle = currentFile.match(titleRegExp)[0].replace('var title = \'','').replace('\'\n','') || "NO VALUE";
				pageCategories = currentFile.match(catRegExp)[0].replace('var categories = \'','').replace('\'\n','').split(",") || "NO VALUE";
				pageDescription = currentFile.match(descriptionRegExp)[0].replace('var description = \'','').replace('\'\n','') || "NO VALUE";
				pagePublishedDate = currentFile.match(publishDateRegExp)[0].replace('var publish_date = \'','').replace('\'\n','') || "NO VALUE";
				// console.log("pagePublishedDate", pagePublishedDate);
				blogPostJson["post" + postCounter] = {
					"file":fileName,
					"title":pageTitle,
					"categories":pageCategories,
					"description":pageDescription,
					"published":pagePublishedDate
				}
        pageCategories.map(function(category, ind, arr){
          // console.log("pageCategories ==> ", category);
          if(blogCategoryJson.hasOwnProperty(category)){
            // do nothing
          } else {
            blogCategoryJson[category] = {
              "files": new Array()
            }
          }
          blogCategoryJson[category]["files"].push(fileName)
        });
				postCounter++;      
      } 
    });
		console.log(blogPostJson);
    console.log(blogCategoryJson);
		buildHtml();
  }
  var buildHtml = function(){
  	console.log("START: buildHtml: root jade");
    gulp.src('./markup/*.jade')
      .pipe(jade({
        pretty: false,
        locals: {
          'posts': blogPostJson,
          'sections': websiteLinks,
          'categories': blogCategoryJson,
          'skills': JSON.parse( fs.readFileSync('./markup/data/skills.json', { encoding: 'utf8' }) ),
          'services': JSON.parse( fs.readFileSync('./markup/data/services.json', { encoding: 'utf8' }) ),
          'resume': JSON.parse( fs.readFileSync('./markup/data/resume.json', { encoding: 'utf8' }) )
        }
      }).on('error', gutil.log))
      .pipe(gulp.dest('../'))
  	console.log("START: buildHtml: blog jade");
    gulp.src('./markup/blog/*.jade')
      .pipe(jade({
        pretty: false,
        locals: {
        	'sections': websiteLinks,
          'posts': blogPostJson,
          'categories': blogCategoryJson
        }
      }).on('error', gutil.log))
      .pipe(gulp.dest('../blog/'))
    buildCategories(blogCategoryJson);
  }
  var buildCategories = function(data){
    for(key in data){
      console.log("buildCategories", key, data[key]);
      gulp.src('./markup/blog/category.jade')
      .pipe(jade({
        pretty: false,
        locals: {
          'key': key,
          'categories': data,
          'sections': websiteLinks,
          'posts': blogPostJson,
        }
      }).on('error', gutil.log))
      .pipe(rename({
        basename: key,
        prefix: "category-",
      }))
      .pipe(gulp.dest('../blog/'))
    }
  }
});
gulp.task('watch', function() {
	gulp.watch('../**/markup/**/*.jade', ['html'])
		.on('change', function(evt) {
			console.log(evt.type, " ==> ", evt.path);
		});
});
gulp.task('default', ['html']);
