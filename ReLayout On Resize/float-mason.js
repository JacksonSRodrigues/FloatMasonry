document.addEventListener("DOMContentLoaded", function(event){
 
    var template = `<div class="mason-element">    
                        <div class="card">
                            <div class="media-container">
                                <img class="banner" src="">
                            </div>
                            <div class="text-container">
                                <h1 class="title"></h1>
                                <hr class="title-line">
                                <p class="description"></p>
                            </div>
                        </div>
                    </div>`;
   var dataColumns = jsonData.data;

   var partialHTMLForItem = function(item, index) {
       
       var templateDiv = document.createElement('div');
       templateDiv.innerHTML = template;

       var mediaContainer = templateDiv.getElementsByClassName('media-container')[0];
       var imageBanner = templateDiv.getElementsByClassName('banner')[0];

       var title = templateDiv.getElementsByClassName('title')[0];
       var description = templateDiv.getElementsByClassName('description')[0];

       if (item.media != undefined && item.media.url != undefined) {
           imageBanner.src = item.media.url;
       }
       else {
           mediaContainer.classList += " hidden";
       }

       title.innerHTML = item.title;
       description.innerHTML = item.description;

       return templateDiv.innerHTML;
   }

   var loadContents = function(container) {
       var partials = ['','',''];
       for (var i = 0 ; i < 1000; i++) {
           var item = dataColumns[i%12];
           partials[i%3] += partialHTMLForItem(item,i);
       }

       container.innerHTML = `<div class="col1"></div>
                              <div class="col2"></div>
                              <div class="col1"></div>`;
       for(i =0 ; i < partials.length ; i++) {
           container.children[i].innerHTML = partials[i];
       }
   }




   var masonContainer = document.getElementsByClassName('float-masonry')[0];
   loadContents(masonContainer);

   var timer = setTimeout(function(){
       masonContainer.innerHTML = '';
       loadContents(masonContainer);
   },10000);

});