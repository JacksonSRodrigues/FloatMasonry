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
            if ( (siblingRect.right < elementRect.left) || elementRect.right < siblingRect.left) {
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
            var rules = 'margin-top:'+(verticalDelta + 3*marginTop)+'px;'
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

    var masonContainer = document.getElementsByClassName('float-masonry')[0];
    generateMasonStyle(masonContainer);



});