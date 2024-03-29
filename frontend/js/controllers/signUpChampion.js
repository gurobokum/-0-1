(function (undefined) {
'use strict';

angular.module('MomAndPop').controller('signUpChampionCtrl', [
    '$scope',
    '$location',
    '$rootScope',
    '$log',
    'formUtils',
    'signUp',
    'facebookAPI',
    'twitterAPI',
function ($scope, $location, $rootScope, $log, formUtils, signUp, facebookAPI, twitterAPI) {
    var image = null;

    $scope.resetGlobal({
        headless: true
    });

    $scope.validateErrorMsg = '';

    $scope.requiredFields = {
        firstName: {
            fieldName: 'firstName',
            describeName: 'First Name'
        },
        lastName: {
            fieldName: 'lastName',
            describeName: 'Last Name'
        },
        mail: {
            fieldName: 'mail',
            describeName: 'Email Address'
        },
        password: {
            fieldName: 'password',
            describeName: 'Password'
        },
        confirmPassword: {
            fieldName: 'confirmPassword',
            describeName: 'Confirm Password'
        }
    };

    $scope.authFb = function () {
        $log.info('login');
        facebookAPI.connect();
        $log.info('finished');
    };

    $scope.authTw = function () {
        $log.info('Twitter login');
        twitterAPI.connect();
        $log.info('login success');
    };

    $scope.submit = function () {
        $log.debug('Submitting..');

        if (!validate()) {
            $log.warn('Form is not valid');
            return;
        }

        if (image) {
            var reader = new FileReader();
            reader.onload = function () {
                request({ blob: reader.result, fileName: image.name});
            }
            reader.readAsBinaryString(image);
            return;
        }

        request();

        function request (blob) {
            // See NOTICE #1
            var q = signUp.champion({
                firstName: $scope.firstName,
                lastName: $scope.lastName,
                email: $scope.mail,
                password: $scope.password,
                interest: $scope.interest
            }, blob);

            q.then(function () {
                $log.debug('Successful registered');
                $location.path('/');
            }, function (err) {
                $log.debug('Request error', err);
                $scope.validateErrorMsg = err;
                $scope.showError = true;
            });
        }
    };

    $scope.toggleAcceptTerms = function () {
        $scope.isAcceptTerms = !$scope.isAcceptTerms;
    };

    $scope.matchPasswords = false;

    function validate () {
        var valid = formUtils.validateRequired($scope, $scope.signUpForm);
        if (!valid)
            return valid;

        $scope.matchPasswords = formUtils.matchPasswords($scope);
        valid = $scope.matchPasswords && valid;
        if (!valid)
            return valid;

        if ($scope.signUpForm.mail.$dirty && $scope.signUpForm.mail.$invalid) {
            $scope.validateErrorMsg = [$scope.validateErrorMsg, 'Email is invalid.'].join(' ');
            return false;
        }

        $scope.afterClickRegister = true;
        return true;
    }
    $scope.looseFocus = formUtils.looseFocus;

    // TODO: move
    $scope.focusInput = function () {
        // if just right after click register, clear error message.
        if ($scope.afterClickRegister) {
            $scope.showError = false;
            $scope.validateErrorMsg = "";
            $scope.afterClickRegister = false;
            // clear all warning border
            $("input").removeClass('invalid');
        }
    };


    // set upload browser button and upload file text field.
    var btn = document.getElementById("uploadBtn");
    btn.onchange = function () {
        document.getElementById("uploadFile").value = this.value;
        image = btn.files[0];
        var path = $scope.fileName = this.value;
        // just show file name
        var fileName = path.replace(/.*\\/, '');
        fileName = fileName.replace(/.*\//, '');
        document.getElementById("uploadFile").value = fileName;
    };
}]);

})();
