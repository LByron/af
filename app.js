/* global angular */
(function() {

    'use strict';



    var app = angular.module('formlyExample', ['formly', 'formlyBootstrap', 'ngAria','ngMessages']);


    app.constant('formlyExampleApiCheck', apiCheck());


    app.config(function config(formlyConfigProvider, formlyExampleApiCheck) {


        // set templates here
        formlyConfigProvider.setType({
            name: 'matchField',
            apiCheck: {
                data: formlyExampleApiCheck.shape({
                    fieldToMatch: formlyExampleApiCheck.string
                })
            },
            apiCheckOptions: {
                prefix: 'matchField type'
            },
            defaultOptions: function matchFieldDefaultOptions(options) {
                return {
                    expressionProperties: {
                        'templateOptions.disabled': function(viewValue, modelValue, scope) {
                            var matchField = find(scope.fields, 'key', options.data.fieldToMatch);
                            if (!matchField) {
                                throw new Error('Could not find a field for the key ' + options.data.fieldToMatch);
                            }
                            var model = options.data.modelToMatch || scope.model;
                            var originalValue = model[options.data.fieldToMatch];
                            var invalidOriginal = matchField.formControl && matchField.formControl.$invalid;
                            return !originalValue || invalidOriginal;
                        },

                        // this expressionProperty is here simply to be run, the property `data.validate` isn't actually used anywhere
                        'data.validate': function(viewValue, modelValue, scope) {
                            scope.fc && scope.fc.$validate();
                        }
                    },
                    validators: {
                        fieldMatch: {
                            expression: function(viewValue, modelValue, fieldScope) {
                                var value = modelValue || viewValue;
                                var model = options.data.modelToMatch || fieldScope.model;
                                return value === model[options.data.fieldToMatch];
                            },
                            message: options.data.matchFieldMessage || '"Must match"'
                        }
                    }
                };

                function find(array, prop, value) {
                    var foundItem;
                    array.some(function(item) {
                        if (item[prop] === value) {
                            foundItem = item;
                        }
                        return !!foundItem;
                    });
                    return foundItem;
                }
            }
        });



    });


    app.run(function(formlyConfig,formlyValidationMessages){




        formlyConfig.setWrapper({
            name: 'validation',
            types: ['input', 'customInput'],
            templateUrl: 'my-messages.html'
        });


        formlyConfig.setType({
            name: 'customInput',
            extends: 'input',
            controller: ['$scope', function($scope) {
                $scope.options.data.getValidationMessage = getValidationMessage;

                function getValidationMessage(key) {
                    var message = $scope.options.validation.messages[key];
                    if (message) {
                        return message($scope.fc.$viewValue, $scope.fc.$modelValue, $scope);
                    }
                }
            }]
        });

        formlyValidationMessages.addTemplateOptionValueMessage('maxlength', 'maxlength', '', 'is the maximum length', 'Too long');
        formlyValidationMessages.addTemplateOptionValueMessage('minlength', 'minlength', '', 'is the minimum length', 'Too short');
        formlyValidationMessages.messages.required = 'to.label + " is required"';
        formlyValidationMessages.messages.email = '$viewValue + " is not a valid email address"';
    });


    app.controller('MainCtrl', function MainCtrl(formlyVersion) {
        var vm = this;
        // function assignment
        vm.onSubmit = onSubmit;

        // variable assignment

        vm.model = {
            awesome: true
        };

        vm.awesomeIsForced = false;

        vm.formFields = [
            {
                key: 'text',
                type: 'input',
                templateOptions: {
                    label: 'Text',
                    placeholder: 'This is a text input'
                }
            },
            {
                key: 'story',
                type: 'textarea',
                templateOptions: {
                    label: 'Some more text',
                    placeholder: 'This is a textarea'
                }
            },
            {
                key: 'awesome',
                type: 'checkbox',
                templateOptions: { label: '' },
                expressionProperties: {
                    'templateOptions.disabled': function() {
                        return vm.awesomeIsForced;
                    },
                    'templateOptions.label': function() {
                        if (vm.awesomeIsForced) {
                            return 'Too bad, formly is really awesome...';
                        } else {
                            return 'Is formly totally awesome? (uncheck this and see what happens)';
                        }
                    }
                }
            },
            {
                key: 'whyNot',
                type: 'textarea',
                expressionProperties: {
                    hide: 'model.awesome',
                    'templateOptions.disabled': 'false'
                },
                templateOptions: {
                    label: 'Why Not?',
                    placeholder: 'Type in here... I dare you'
                },
                watcher: {
                    listener: function(field, newValue, oldValue, scope, stopWatching) {
                        if (newValue) {
                            console.log(newValue);
                            stopWatching();
                            scope.model.awesome = true;
                            scope.model.whyNot = undefined;
                            field.expressionProperties.hide = null;
                            field.expressionProperties['templateOptions.disabled'] = 'true';
                            field.templateOptions.placeholder = 'Too bad... It really is awesome!  Wasn\'t that cool?';
                            vm.awesomeIsForced = true;
                        }
                    }
                }
            },
            {
                key: 'exampleDirective',
                template: '<div example-directive></div>',
                templateOptions: {
                    label: 'Example Directive'
                }
            },
            {
                key: "color",
                type: "radio",
                templateOptions: {
                    label: "Color Preference (try this out)",
                    options: [
                        {
                            "name": "No Preference",
                            "value": null
                        },
                        {
                            "name": "Green",
                            "value": "green"
                        },
                        {
                            "name": "Blue",
                            "value": "blue"
                        }
                    ]
                }
            },
            {
                key: 'password',
                type: 'input',
                templateOptions: {
                    type: 'password',
                    label: 'Password',
                    placeholder: 'Must be at least 3 characters',
                    required: true,
                    minlength: 3
                }
            },
            {
                key: 'confirmPassword',
                type: 'input',
                optionsTypes: ['matchField'],
                model: vm.confirmationModel,
                templateOptions: {
                    type: 'password',
                    label: 'Confirm Password',
                    placeholder: 'Please re-enter your password',
                    required: true
                },
                data: {
                    fieldToMatch: 'password',
                    modelToMatch: vm.model
                }
            },
            {
                key: 'ip',
                type: 'customInput',
                validators: {
                    ipAddress: {
                        expression: function(viewValue, modelValue) {
                            var value = modelValue || viewValue;
                            return /(\d{1,3}\.){3}\d{1,3}/.test(value);
                        },
                        message: '$viewValue + " is not a valid IP Address"'
                    }
                },
                templateOptions: {
                    label: 'IP Address',
                    required: true,
                    type: 'text',
                    placeholder: '127.0.0.1'
                }
            }
        ];

        // function definition
        function onSubmit() {

            vm.formFields.forEach(function(field){
                field.validation.show = true;
            });

            alert(JSON.stringify(vm.model), null, 2);
        }
    });


    app.directive('exampleDirective', function() {
        return {
            templateUrl: 'example-directive.html'
        };
    });
})();
