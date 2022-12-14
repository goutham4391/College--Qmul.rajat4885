// Funnelback auto-completion jQuery plugin
// Author: Nicolas Guillaumin, Matt Sheppard
// Copyright Funnelback, 2012
// $Id: jquery.funnelback-completion.js 39697 2014-07-14 23:58:17Z lbutters $
(function($) {
 
        
    $.fn.fbcompletion = function(settings) {
        
        var facetBasedCompletionSuccess = function(config, request, data) {
            var responses = new Array();
            var partial_query_parts = request.term.split(" ");
            var last_partial_term = partial_query_parts[partial_query_parts.length -1];
            var partial_complete_query = request.term.substring(0, 
                                          request.term.length - last_partial_term.length);
            if(last_partial_term.substring(0,1) == '|') {
              last_partial_term = last_partial_term.substring(last_partial_term.indexOf(':') + 1, last_partial_term.length);
            }
            var lower_last_partial_term = last_partial_term.toLowerCase();
            
            
            
            var facets = data.response.facets;
            var rank = 1;
            for (var i=0; i<facets.length; i++) {
                var facet = facets[i];
                var category = facet.name;
                if(typeof (facet.categories) != "undefined") {
                    var acceptTermBasedOnFacetName = 
                        facet.name.substring(0, last_partial_term.length).toLowerCase()
                          == lower_last_partial_term;
                    for(var j=0; j<facet.categories[0].values.length; j++){
                        var value = facet.categories[0].values[j];
                        
                        var facetQueryTerm = '|' + value.constraint + ':' + value.label;
                        
                        if((value.label.substring(0, last_partial_term.length) 
                            == last_partial_term || acceptTermBasedOnFacetName)
                            && request.term.indexOf(facetQueryTerm) == -1
                          ) {
                              var extra = {
                                    action_t: 'E',
                                    //action: "/s/search.html?" + config.query + '&' + value.queryStringParam,
                                    action: partial_complete_query + facetQueryTerm + ' ',
                                    value: partial_complete_query + value.label,
                                    category: category,
                                    rank: rank,
                                    matchOn: request.term,
                                    disp_t:'H',
                                    disp: value.label,
                                    wt: 500,
                                    
                                  };
                              //console.log("action" + extra.action);
                              responses.push({
                                  label: extra.disp,
                                  value: extra.value,
                                  extra: extra,
                                  matchOn: extra.matchOn,
                                  category: extra.category,
                                  rank: extra.rank,
                              });
                              rank++;
                        }
                    }
                }
            }
            return responses;
        }
        
        var config = {
            'collection'                   : 'funnelback_documentation',
            'show'                         : 10,
            'sort'                         : 0,
            'delay'                        : 0,
            'length'                       : 3,
            'alpha'                        : 0.5,
            'program'                      : '/s/redirect',
            'interactionLog'               : '/s/log',
            'format'                       : 'simple',
            'enabled'                      : 'disabled',
            'standardCompletionEnabled'    : true, 
            'logging'                      : 'enabled',
            'dwellLogging'                 : 'enabled',
            'dwellLoggingTimeout'          : 3000,
            'selectLogging'                : 'enabled',
            'tmplId'                       : 'fb-completion-tmpl',
            'profile'                      : '_default',
            //search based completion
            'searchBasedCompletionEnabled' : false,
            'searchBasedCompletionProgram' : '/s/redirect',
            'searchBasedCompletionProfile' : null,
            'searchBasedCompletionFunction': facetBasedCompletionSuccess, 
            'zindex'                       : 1000,
            'width'                        : '100%',
            'position'                     : 'absolute',
            'backgroundcolor'              : '#fff',
            'left'                         : 'auto',
            'top'                          : 'auto'
        };
        
        

        /*
        * This function logs events to the interaction log, and once the logging 
        * has been completed, executes the given action callback.
        *
        * loggingEnabled - Whether logging should be performed (action will be called
        *    regardless of whether logging is enabled)
        * mayBeAsync - Can the logging be done asyncronously?
        *    Must be false if executing action will load a new page (unloading the current one)
        * type - The type of event to log
        * paramters - Properties to log with the event
        * action - Callback to be executed after logging
        */
        var logger = function(loggingEnabled, mayBeAsync, type, parameters, action) {
            if(loggingEnabled && config.logging === 'enabled'){
                var log_url = config.interactionLog
                                + '?collection=' + config.collection
                                + '&type=' + encodeURIComponent(type)
                                // Send the local time as Ajax requests might arrive out of order
                                // on the server side
                                + '&client_time=' + (new Date()).getTime()
                                + ((config.profile !== '') ? '&profile=' + config.profile : '' );
                // Fill in the specific logging parameters
                for (var key in parameters) {
                    log_url += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key]);
                }

                if (mayBeAsync) {
                    action();
                    jQuery.ajax({
                        type: 'GET',
                        url:  log_url,
                        error: function(xhr, textStatus, errorThrown) {
                            if (window.console) {
                                console.log('Interaction log error: ' + textStatus + ', ' + errorThrown);
                            }
                        }
                    });
                } else {
                    jQuery.ajax({
                        type: 'GET',
                        url:  log_url,
                        error: function(xhr, textStatus, errorThrown) {
                            if (window.console) {
                                console.log('Interaction log error: ' + textStatus + ', ' + errorThrown);
                            }
                            action();
                        },
                        success:  function(data) {
                            action();
                        }
                    });
                }
            } else {
                action();
            }
        };
   
        if (settings) $.extend(config, settings);
    
        if (config.enabled != 'enabled' ) {
            return;
        }
    
        this.each(function() {
            var targetElement = this;

            var dwellTimeoutCallback;

            // Compile jQuery template
            var compiledTmpl;
            if (jQuery().template) {
                if (jQuery('#'+config.tmplId).length > 0) {
                    compiledTmpl = jQuery('#'+config.tmplId).template();
                } else {
                    compiledTmpl = jQuery('<script>[Error: Template <tt>'+config.tmplId+'</tt> not found]</script>').template();
                }
            }

            var searcharea = $(targetElement).parent();
  
            $(targetElement).autocomplete( {
                appendTo: ($("#fb-queryform").length > 0) ? "#fb-queryform" : searcharea,
                source: function (request, response) {
                    var finished = [!config.searchBasedCompletionEnabled, !config.standardCompletionEnabled];
                    var allResponses = [new Array(), new Array()];
                    
                    if(config.searchBasedCompletionEnabled) {
                      jQuery.ajax({
                          type: 'GET',
                          url: config.searchBasedCompletionProgram
                              + '?'
                              + replaceQueryInQuestionWithPartialQuery(config.query, request.term,
                                                         config.searchBasedCompletionProfile),
                          dataType: 'jsonp',
                          error: function(xhr, textStatus, errorThrown) {
                            if (window.console) { 
                                  console.log('Autocomplete error: ' + textStatus + ', ' + errorThrown);
                              }
                          },
                          success:  function(data) {
                              //Call the function that will process the json.
                              allResponses[0] = config.searchBasedCompletionFunction(config, request, data);
                              finished[0] = true;
                              if(finished[1]) {
                                response (allResponses[1].concat(allResponses[0]));
                              }
                              
                          }
                      });
                    }
                    if(config.standardCompletionEnabled) {
                      jQuery.ajax({
                          type: 'GET',
                          url: config.program
                              + '?collection=' + config.collection
                              + '&partial_query=' + request.term.replace(/ /g, '+')
                              + '&show=' + config.show
                              + '&sort=' + config.sort
                              + '&alpha=' + config.alpha
                              + '&fmt=' + ((config.format == 'simple') ? 'json' : 'json++') 
                              + ((config.profile !== '') ? '&profile=' + config.profile : '' )
                          ,
                          dataType: 'jsonp',
                          error: function(xhr, textStatus, errorThrown) {
                            if (window.console) { 
                                  console.log('Autocomplete error: ' + textStatus + ', ' + errorThrown);
                              }
                          },
                          success:  function(data) {
                              var responses = allResponses[1];
      
                              for (var i=0; i<data.length; i++) {
                                  var suggestion = data[i];
      
                                  if (suggestion == null) {
                                      continue;
                                  }

                                  if (typeof(suggestion) == 'string') {
                                      // Single string suggestion
                                      responses.push({
                                          label: suggestion,
                                          matchOn: request.term,
                                          rank: i + 1
                                      });
                                  } else if (typeof(suggestion) == 'object') {
                                      responses.push({
                                          label: (suggestion.disp) ? suggestion.disp : suggestion.key,
                                          value: (suggestion.action_t == 'Q') ? suggestion.action : suggestion.key,
                                          extra: suggestion,
                                          matchOn: request.term,
                                          category: suggestion.cat,
                                          rank: i + 1
                                      });
                                  }
                              }
                              
                              finished[1] = true;
                              if(finished[0]) {
                                response (allResponses[1].concat(allResponses[0]));
                              }
                          }
                      });
                    }
                },

                open: function() {
                    jQuery(this).autocomplete('widget').css('z-index', config.zindex).css('width', config.width).css('position', config.position).css('background-color', config.backgroundcolor).css('left', config.left).css('top', config.top);

                    /* 
                    * Clear any existing dwell logging timeout before we (potentially) set
                    * a new one to reflect the changed menu.
                    */
                    if (typeof dwellTimeoutCallback !== 'undefined') {
                        clearTimeout(dwellTimeoutCallback);
                    }

                    // Set a new dwell logging timeout if this logging is active
                    if(config.dwellLogging === 'enabled'){
                        dwellTimeoutCallback = setTimeout(
                            function(event) {
                                var partialQuery = $(targetElement).val();
                                logger(
                                    config.dwellLogging === 'enabled',
                                    true,
                                    "dwell",
                                    {partial_query: partialQuery},
                                    function(){
                                        /* Do nothing, we're just logging the fact */
                                    }
                                )
                            },
                            config.dwellLoggingTimeout
                        );
                    }

                    return false;
                },

                close: function() {
                    // Clear any dwell timeout callback when the menu gets closed
                    if (typeof dwellTimeoutCallback !== 'undefined') {
                        clearTimeout(dwellTimeoutCallback);
                    }
                },

                delay: config.delay,

                minLength: config.length,
                select: function(evt, ui) {
                    // Log select events before perfoming the associated action
                    
                    var logMayBeAsync = false;
                    // Logging can only be async if the page won't change
                    // We assume any javascript callback you're using won't change the page
                    if (ui.item.extra) {
                        if (ui.item.extra.action_t == 'C' ||
                            ui.item.extra.action_t == 'E') {
                            logMayBeAsync = true;
                        }
                    }
                    logger(
                        config.selectLogging === 'enabled',
                        logMayBeAsync,
                        "select",
                        {
                            action_type: ui.item.extra.action_t,
                            action: ui.item.extra.action,
                            value: ui.item.value,
                            category: ui.item.category,
                            rank: ui.item.rank,
                            partial_query: ui.item.matchOn
                        },
                        function() {
                            if (ui.item.extra) {
                                switch(ui.item.extra.action_t) {
                                     case 'C':                                                                 
                                        eval(ui.item.extra.action);
                                        break;
                                    case 'U':
                                        document.location = ui.item.extra.action;
                                        break;
                                    case undefined:
                                    case '':
                                        $(targetElement).val(ui.item.value);
                                        $(targetElement).context.form.submit();
                                        break;
                                    case 'E':
                                        $(targetElement).val(ui.item.extra.action);
                                        var that = $(targetElement);
                                        // Ensure menu is opening again (http://bugs.jqueryui.com/ticket/8784)
                                        setTimeout( function() { that.autocomplete('search'); }, 1);
                                        break;
                                    case 'Q':
                                    default:
                                        $(targetElement).val(ui.item.extra.action);
                                        $(targetElement).context.form.submit();
                                }
                            } else {
                                // Submit the form on select
                                $(targetElement).val(ui.item.value);
                                $(targetElement).context.form.submit();
                            }
                        }
                    );
                    return false;
                }
            }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
                var label;

                if ( item.extra ) { // Complex suggestion
                    switch (item.extra.disp_t) {
                        case 'J':   // Json data
                            if (compiledTmpl) {
                                label = jQuery.tmpl(compiledTmpl, item.extra.disp).appendTo('<p></p>').parent().html();
                            } else {
                                label = '[Error: jQuery template plugin is unavailable]';
                            }
                            break;
                        case 'C':   // JS callback
                            label = eval(item.extra.disp);
                            break;
                        case 'T':   // Plain text
                            label = item.label.replace(new RegExp('('+item.matchOn+')', 'i'), '<strong>$1</strong>');
                            break;
                        case 'H':   // HTML
                                    // Label cannot be highlighted as there's no way
                                    // to skip HTML tags when running the regexp, possibly
                                    // corrupting them (ex: <img src="h<strong>t</strong>tp://...)
                        default:
                            label = item.label;
                    }
                } else {
                    // Single string suggestion
                    label = item.label.replace(new RegExp('('+item.matchOn+')', 'i'), '<strong>$1</strong>');
                }
                return jQuery('<li></li>')
                    .data( 'item.autocomplete', item)
                    .append( '<a>' + label + '</a>' )
                    .appendTo(ul);
            };

            $(targetElement).data("ui-autocomplete")._renderMenu = function(ul, items) {
                var that = this;
                var currentCategory = '';
                jQuery.each(items, function(index, item) {
                    if (item.category && item.category != currentCategory) {
                        ul.append('<li class="ui-autocomplete-category">'+item.category+"</li>");
                        currentCategory = item.category;
                    }
                    that._renderItemData(ul, item);
                });
            //    ul.append( '<li class="view-all"><a href="//search07.funnelback.co.uk/s/search.html?collection=queenmary-coursefinder-undergraduate-meta&query='+ this.term + '*">View all results for <strong>'+ this.term + '</strong></a></li>' );
            ul.append( '<li class="view-all"><a href="//qmul-search.clients.uk.funnelback.com/s/search.html?collection=queenmary-coursefinder-undergraduate-meta&query='+ this.term + '*">View all results for <strong>'+ this.term + '</strong></a></li>' );
            }

        });
        return this;
    };
 
    /**
     * Replaces the query= value with the completed part of the partial query
     * 
     *<p>e.g. if question is query=old&bar=foo and partialQuery is 'hello moth'
     *it will return query=hello&bar=foo</p>
     * 
     * */
    function replaceQueryInQuestionWithPartialQuery(encodedQuestion, partialQuery, profile) {
        var question = htmlDecode(encodedQuestion);
        var partial_query_parts = partialQuery.split(" ");
        var last_partial_term = partial_query_parts[partial_query_parts.length -1];
        var partial_complete_query = partialQuery.substring(0, partialQuery.length - last_partial_term.length);
        if(partial_complete_query.length == 0) {
           partial_complete_query = '!padrenull'; 
        }
        var questionsParts = question.split('&');
        var newQuestion = '';
        var changedQuery = false;
        var changedProfile = false;
        for(var i = 0; i < questionsParts.length; i++) {
          if(questionsParts[i].substring(0, 6) == 'query=') {
              newQuestion += 'query=' + partial_complete_query;
              changedQuery = true;
          }  else if(profile != null && questionsParts[i].substring(0, 8) == 'profile=') {
              newQuestion += 'profile=' + profile;
              changedProfile = true;
          } else {
              newQuestion += questionsParts[i];
          }
          newQuestion += '&';
        }
        
        if(!changedQuery) {
            newQuestion += 'query=' + partial_complete_query;
            newQuestion += '&';
        }
        if(!changedProfile && profile != null) {
            newQuestion += 'profile=' + profile;
            newQuestion += '&';
        }
        return newQuestion.substring(0, newQuestion.length -1);
    }
    
    function htmlDecode(value){
      return $('<div/>').html(value).text();
    }
 })(jQuery);
