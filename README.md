# static-site-generation-with-jade-gulp

## SUPER SIMPLE Static Site Generation with Jade, Gulp and JSON.


###Static Site? But...why?
If you are asking this question, do yourself a favor and skim through the free O’Reilly book [Static Site Generators: Modern Tools for Static Website Development](http://www.oreilly.com/web-platform/free/static-site-generators.csp).
The quick answer is because you can have a static website and still have all the bells and whistles.
The slightly longer answer is a static website will perform well, can be hosted anywhere, is secure and can easily be version controlled. For more on these points, read the book mentioned above.

What I didn’t realize until I noticed an email from O’Reilly about the book, is that I’m already using the concepts of Static Site Generators, except without the Generator part. I recently rebuilt my [employer’s website](http://besentient.com/) using gulp, Jade templates and JSON. It is a homepage with some case study pages. I wanted to learn Jade because I’m also dabbling in Express.js and html pages fulfilled the requirements of the project. Piping the data into Jade was something I had to work hard to understand, so hopefully this helps someone else.

[Check out the code on github](https://github.com/Bushwazi/static-site-generation-with-jade-gulp)

###The Goal.
So after reading the book, I thought it would helpful for other developers to see my approach. To-do MVC is the standard for example projects like this, but to me it was more comparable to a simple WordPress website.
So what is appealing about the basic WordPress site the we often build? I thought it was the stuff you get right out of the box with the 2016 theme:

1. Theming/Templates (header, footer, shared markup)
2. Easy page generation
3. Easy post generation
4. Easy to get a post loop in a page (via the loop)
5. Sorting posts by categories (vie the loop)

So the approach I took was building a new portfolio site for myself, just lacking the final content. Which would lead to the following pages:

1. Home => index.html
2. About Me => about.html
3. Resume => resume.html
4. Contact Me => contact.html
5. Blog => blog/index.html which loops over all blog posts and provides a teaser
6. Blog Pages => blog/[PAGE NAME].html
7. Blog Categories => blog/category-[CATEGORY NAME].html
8. Assets => public/ just a home for images, css, js

###The Core Tools.
Ok, if you aren’t slightly familiar with these tools, check them out and double back. I’m going to jump right in.

1. [Node.js](https://nodejs.org/en/): node serves as the server and the engine in the build process
2. [Gulp.js](http://gulpjs.com/): the task manager
3. [Jade Templates](http://jade-lang.com/) ([gulp-jade](https://www.npmjs.com/package/gulp-jade)): the templating system
4. [JSON](http://www.json.org/): serves as our database

###The build.
I have a personal preference that I don’t like gulp and node messing up my root folder, so I like to tuck the gulp build into a [_src](https://github.com/Bushwazi/static-site-generation-with-jade-gulp/tree/master/_src) directory.
So I’ll start by breaking down what is in there.

/\_src  
gulpfile.js (the directions for the tasks)  
package.json (default npm file with node modules,etc)  
markup/ (where the jade templates live)  
-- /\_inc/ (basic template files, or includes. a grouping of markup that is included in each page)  
---- foot.jade (usually just the scripts or GA tracking)  
---- footer.jade (the site footer menu and copyright, loops over post list and sections)  
---- head.jade (repetitive html head content)  
---- header.jade (the site header, main navigation, loops over sections)  
-- \_templates/ (templates for page types)  
---- main.jade (core page template)  
---- post.jade (post page template)  
-- blog/  
---- about-content.jade (a blog post)  
---- about-gulp.jade (a blog post)  
---- category.jade (template page for category pages)  
---- index.jade (page the previews the posts, loops over posts and categories)  
---- why.jade (a blog post)  
-- data/  
---- resume.json (sample resume data)  
---- services.json (sample services data)  
---- skills.json (sample skills data)  
-- about.jade (content for about us page)  
-- contact.jade (content for about us page)  
-- index.jade  (content for about us page, loops over services and skills)  
-- resume.jade  (content for about us page, loops over resume data)  

__Three collections__ of data are mentioned but are not JSON files.

1. sections is an array called ‘websiteLinks’ that is in the gulpfile.js
2. blog posts is data that is created via the gulpfile.js, stored in memory and then used by the gulpfile.js
3. blog categories is data that is created via the gulpfile.js, stored in memory and then used by the gulpfile.js

###DATA!
There are three ways data is used to build this project. All three methods are then passed into the Jade build using __Jade locals__.

1. JSON files in /_src/markup/data => the idea here is that you can use Excel and make a datatable, export as CSV and convert it to JSON. I usually end up on [this website to convert to JSON](http://www.convertcsv.com/csv-to-json.htm).
2. javascript array for the websiteLinks, or sections as they are called once they enter Jade
3. using [node fs](https://nodejs.org/api/fs.html) to loop over and read the files in the build to create a dataset for blog posts and blog categories

###MARKUP!
The markup is all housed in the /_src/markup directory. This is just your standard Jade build. If you don’t understand this section, learn more about Jade and come on back. The real magic is using Jade locals to pass data in, so I’ll focus more on that. A short description of each file is above in the build.

###STYLES!
I added just enough CSS to make the page have minimal layout. This article is about the markup, so I’m not going to focus on CSS.

###JAVASCRIPT!
See the paragraph on styles above and replace ‘CSS’ with ‘javascript’.

###TASK MANAGEMENT!
The gulpfile.js, this is where it all goes down. You can see the whole file in the [Github repo](https://github.com/Bushwazi/static-site-generation-with-jade-gulp/blob/master/_src/gulpfile.js). I’ll break down each section.

####The variables:

__The modules includes:__  
var fs = require('fs'),  
&nbsp;&nbsp;&nbsp;&nbsp;gulp = require('gulp'),  
&nbsp;&nbsp;&nbsp;&nbsp;gutil = require('gulp-util'),  
&nbsp;&nbsp;&nbsp;&nbsp;jade = require('gulp-jade'),  
&nbsp;&nbsp;&nbsp;&nbsp;rename = require("gulp-rename"),   
__Some Regular Expression caching__  
&nbsp;&nbsp;&nbsp;&nbsp;titleRegExp = /var title \=(.\*?)\n/g,  
&nbsp;&nbsp;&nbsp;&nbsp;catRegExp = /var categories \=(.\*?)\n/g,  
&nbsp;&nbsp;&nbsp;&nbsp;descriptionRegExp = /var description \=(.\*?)\n/g,   
&nbsp;&nbsp;&nbsp;&nbsp;publishDateRegExp = /var publish_date \=(.\*?)\n/g,  
__Initializing some variables__  
&nbsp;&nbsp;&nbsp;&nbsp;fileName = null,  
&nbsp;&nbsp;&nbsp;&nbsp;pageTitle = null,  
&nbsp;&nbsp;&nbsp;&nbsp;pageCategories = null,  
__Initializing the js objects for data storage__  
&nbsp;&nbsp;&nbsp;&nbsp;blogPostJson = new Object(),  
&nbsp;&nbsp;&nbsp;&nbsp;blogCategoryJson = new Object(),  
&nbsp;&nbsp;&nbsp;&nbsp;currentFile = null,  
&nbsp;&nbsp;&nbsp;&nbsp;postCounter = null,  
__Storing some data__  
&nbsp;&nbsp;&nbsp;&nbsp;websiteLinks = ['HOME','ABOUT','RESUME','BLOG','CONTACT'];  

__The HTML task__
gulp.task('html', function() {  
&nbsp;&nbsp;&nbsp;&nbsp;postCounter = 0;  
__Use node’s fs module to read the blog directory and pass the data to the buildBlogData function__
&nbsp;&nbsp;&nbsp;&nbsp;fs.readdir("./markup/blog", function(err,files){  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if (err) throw err;  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;buildBlogData(files);  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;});  
&nbsp;&nbsp;&nbsp;&nbsp;var buildBlogData = function(data){  
__Use map to loop through the data and collect the relevant information__  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;data.map(function(url, ind, arr){  
__If the page is jade and is not the index or category page, then collect information from it__  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if(url.indexOf(".jade") > 0 && url.indexOf("index") < 0 && url.indexOf("category") < 0){  
__Use node’s fs.readFileSync to read the contents of each file__  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;currentFile = fs.readFileSync("./markup/blog/" + url, 'utf8');  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fileName = url; // url is from map’s anonymous function  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pageTitle = currentFile.match(titleRegExp)[0].replace('var title = \'','').replace('\'\n','') || "NO VALUE"; // use RegExp to find the line with the title in it, and then strip out everything except the value. The next three do the same thing but for categories, description and published date.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pageCategories = currentFile.match(catRegExp)[0].replace('var categories = \'','').replace('\'\n','').split(",") || "NO VALUE";  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pageDescription = currentFile.match(descriptionRegExp)[0].replace('var description = \'','').replace('\'\n','') || "NO VALUE";  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pagePublishedDate = currentFile.match(publishDateRegExp)[0].replace('var publish_date = \'','').replace('\'\n','') || "NO VALUE";  
__Add the data to the blogPostJson object__  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;blogPostJson["post" + postCounter] = {  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"file":fileName,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":pageTitle,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"categories":pageCategories,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":pageDescription,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"published":pagePublishedDate  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}  
__And use the pageCategories data to build out and object for the blogCategoryJson__  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pageCategories.map(function(category, ind, arr){  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if(blogCategoryJson.hasOwnProperty(category)){  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// do nothing  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;} else {  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;blogCategoryJson[category] = {  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"files": new Array()  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;blogCategoryJson[category]["files"].push(fileName)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;});  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;postCounter++;        
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}   
&nbsp;&nbsp;&nbsp;&nbsp;});  
&nbsp;&nbsp;&nbsp;&nbsp;buildHtml();  
}  
__And back the the normal gulp-jade task where we then pass all the data collected above into the jade build.__  
&nbsp;&nbsp;&nbsp;&nbsp;var buildHtml = function(){  
__Build the pages__  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;gulp.src('./markup/\*.jade')  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.pipe(jade({  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pretty: false,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;locals: {  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'posts': blogPostJson, // built via our loop above  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'sections': websiteLinks, // built in variables  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'categories': blogCategoryJson, // build via our loop above  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'skills': JSON.parse( fs.readFileSync('./markup/data/skills.json', { encoding: 'utf8' }) ), // an external JSON file  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'services': JSON.parse( fs.readFileSync('./markup/data/services.json', { encoding: 'utf8' })  // an external JSON file),  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'resume': JSON.parse( fs.readFileSync('./markup/data/resume.json', { encoding: 'utf8' }) ) // an external JSON file  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}).on('error', gutil.log))  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.pipe(gulp.dest('../'))  
__Build the blog index and post pages__  
&nbsp;&nbsp;&nbsp;&nbsp;gulp.src('./markup/blog/*.jade')  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.pipe(jade({  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pretty: false,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;locals: {  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'sections': websiteLinks,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'posts': blogPostJson,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'categories': blogCategoryJson  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}).on('error', gutil.log))  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.pipe(gulp.dest('../blog/'))  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;buildCategories(blogCategoryJson);  
&nbsp;&nbsp;&nbsp;&nbsp;}    
__And build the category pages. This one loops through blogCategoryJson and builds a page for each key in the object__  
&nbsp;&nbsp;&nbsp;&nbsp;var buildCategories = function(data){  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for(key in data){  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console.log("buildCategories", key, data[key]);  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;gulp.src('./markup/blog/category.jade')  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.pipe(jade({  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pretty: false,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;locals: {  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'key': key,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'categories': data,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'sections': websiteLinks,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'posts': blogPostJson,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}).on('error', gutil.log)) 
__rename the file based on the key in the object__   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.pipe(rename({  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;basename: key,  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prefix: "category-",  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}))  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.pipe(gulp.dest('../blog/'))  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}  
&nbsp;&nbsp;&nbsp;&nbsp;}  
});  

So that was a lot to take in, but I hope my comments cleared up what the intention is at each pause.  

So now we have all the data we need available for our Jade loops. You’ll notice that we call the ones used on each page in the template files. (_src/markup/templates/ main.jade and post.jade)  
&nbsp;&nbsp;&nbsp;&nbsp;- var sections = locals['sections']  
&nbsp;&nbsp;&nbsp;&nbsp;- var posts = locals['posts'] 
 
And then we call specific data on pages where it is needed, like in the markup/index.jade file. The page loops over services and skills, so I needed to include the data there  
&nbsp;&nbsp;&nbsp;&nbsp;- var services = locals['services']  
&nbsp;&nbsp;&nbsp;&nbsp;- var skills = locals['skills']  

That’s it. Complicated and simple all in one!