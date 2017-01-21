document.addEventListener("DOMContentLoaded", function(event){

    // Stores the refrence columns for the elements to match and find the column index.
    var columnRefences = [];

    // Stores the height/filled in each column.
    var renderedColumnHeights = [];

    // column height of the right most item in the column, 
    // which becomes the refence to find the next/future column to place the element.
    var refrenceLine = 0;

    var getStyle = function(name) {
        var style = document.createElement('style');
        style.id = name;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(""));
        injectStyle(style);
        return style;
    };

    var injectStyle = function(style) {
        document.head.appendChild(style);
    }

    var removeStyle = function(name) {

    }

    function addCSSRule(sheet, selector, rules, index) {
        if ("insertRule" in sheet) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        }
        else if ("addRule" in sheet) {
            sheet.addRule(selector, rules, index);
        }
    }

    // Returns the element which is visually above the given element.
    var visuallyAboveSibling = function(element, lastCheckedElement) {

        var siblingElement = undefined;
        var visaullyTopElement = undefined;
        if (lastCheckedElement != undefined) { // if there is a last checked element then check for its sibling.
            siblingElement = lastCheckedElement.previousElementSibling;
        }
        else {
            siblingElement = element.previousElementSibling;
        }

        if (siblingElement != undefined) {

            var elementRect = element.getBoundingClientRect();
            var siblingRect = siblingElement.getBoundingClientRect();
            

            //  sl------sr                 sl-------sr
            //             el-----------er
            // Instead of checking if elements overlaps,
            // we will make sure it doesnt overlap which has only two possiblities as above
            if ( (siblingRect.right <= elementRect.left) || elementRect.right <= siblingRect.left) {
                // if doenst overlap, check the next element.
                visaullyTopElement = visuallyAboveSibling(element,siblingElement);
            }
            else { // its the element
                visaullyTopElement = siblingElement;
            }
        }

        return visaullyTopElement;
    };

    var appendMasonStyleForElement = function(element, index, stylesheet) {

        var verticallyAboveSibling = visuallyAboveSibling(element);

        if (verticallyAboveSibling != undefined) {
            var elementRect = element.getBoundingClientRect();
            var verticalSiblingRect = verticallyAboveSibling.getBoundingClientRect();
            
            var elementStyle = window.getComputedStyle(element);
            var verticalDelta = (verticalSiblingRect.bottom - elementRect.top);
            var marginTopParsed = elementStyle['margin-top'] || elementStyle['marginTop'];
            var marginTop = parseFloat(marginTopParsed);

            var masonElementSelector = '.float-masonry .mason-element:nth-child('+index+')';
            var rules = 'margin-top:'+(verticalDelta)+'px;'
            addCSSRule(stylesheet,masonElementSelector,rules);
        }

    };


    var generateMasonStyle = function(container) {
        var sheetName = "float_mason_style_sheet";
        var style = getStyle(sheetName);
        var masonElements = container.children;
         for (var i = 0; i < masonElements.length; i++ ) {
             appendMasonStyleForElement(masonElements[i], (i+1), style.sheet);
         }
        injectStyle(style);
    }



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
       var partials = "";
       for (var i = 0 ; i < 100; i++) {
           var item = dataColumns[i%12];
           partials += partialHTMLForItem(item,i);
       }

       container.innerHTML = partials;
   }




   var masonContainer = document.getElementsByClassName('float-masonry')[0];
   loadContents(masonContainer);

   var timer = setTimeout(function(){
       generateMasonStyle(masonContainer);
   },10000);

});