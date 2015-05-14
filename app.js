/* global angular */
(function() {

    'use strict';



    var app = angular.module('formlyExample', ['formly', 'formlyBootstrap']);


    app.constant('formlyExampleApiCheck', apiCheck());


    app.config(function config(formlyConfigProvider, formlyExampleApiCheck) {

        // set templates here
        formlyConfigProvider.setType({
            name: 'custom',
            templateUrl: 'custom.html'
        });


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


    app.controller('MainCtrl', function MainCtrl(formlyVersion) {
        var vm = this;
        // function assignment
        vm.onSubmit = onSubmit;

        // variable assignment
        vm.env = {
            angularVersion: angular.version.full,
            formlyVersion: formlyVersion
        };

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
                    placeholder: 'Formly is terrific!'
                }
            },
            {
                key: 'story',
                type: 'textarea',
                templateOptions: {
                    label: 'Some sweet story',
                    placeholder: 'It allows you to build and maintain your forms with the ease of JavaScript :-)'
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
                key: 'custom',
                type: 'custom',
                templateOptions: {
                    label: 'Custom inlined',
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
            }
        ];

        // function definition
        function onSubmit() {
            alert(JSON.stringify(vm.model), null, 2);
        }
    });


    app.directive('exampleDirective', function() {
        return {
            templateUrl: 'example-directive.html'
        };
    });
})();
