(function (undefined) {

angular.module('MomAndPop').service('formUtils', ['$log', function ($log) {
    var self = this;
    /**
     * @param {Object] $scope
     *   @key {String} validateErrorMsg
     *   @key {Object} requiredFields
     *   @key {Boolean} showError
     * @param {Object} form
     * @return {Boolean} valid
     */

    this.validateRequired = function ($scope, form) {
        $scope.validateErrorMsg = '';

        var requiredFieldNotFilled = [];
        _.forEach($scope.requiredFields, function (item, index) {
            if (form[ item.fieldName ] && form[ item.fieldName ].$error.required) {
                requiredFieldNotFilled.push(item.describeName);
                $log.debug('formUtils service:: empty required field', item.fieldName);
                $("input[name=" + item.fieldName + "]").addClass('invalid');
            }
        });

        if (requiredFieldNotFilled.length > 0) {
            $scope.showError = true;
            for (var i = 0; i < requiredFieldNotFilled.length; i++) {
                $scope.validateErrorMsg += requiredFieldNotFilled[i];
                // last element
                if (i == requiredFieldNotFilled.length - 1) {
                    if (requiredFieldNotFilled.length == 1) {
                        $scope.validateErrorMsg += ' is required. ';
                    } else {
                        $scope.validateErrorMsg += ' are required. ';
                    }
                } else {
                    $scope.validateErrorMsg += ', ';
                }
            }
        }

        $log.debug('formUtils service:: validateRequired', !$scope.showError);

        return !$scope.showError;
    };

    /**
     * @param {Object} $scope
     *   @key {String} password
     *   @key {String} configPassword
     *   @key {String} validateErrorMsg
     *   @key {Boolean} showError
     * @return {Boolean} match
     */
    this.matchPasswords = function ($scope) {
        if ($scope.password === undefined && $scope.configPassword === undefined)
            return true;

        var match = $scope.password === $scope.confirmPassword &&
            ( $scope.password.length > 0 && $scope.confirmPassword.length > 0 );

        $log.debug('formUtils service:: match passwords', match);

        if (!match) {
            $scope.validateErrorMsg = [$scope.validateErrorMsg, 'Confirm password is not same as password.'].join(' ');
            $scope.showError = true;
        }
        return match;
    };

    /**
     * Tool function for FormUtils, when loose focus, validate input value
     * @param {Object} $event - jQuery event
     * @param {Object} $scope
     *   @key {Boolean} showError
     *   @key {String} validateErrorMsg
     *   @key {Object} requiredFields
     *   @key {Boolean} matchPasswords
     * @param {Object} form
     */
    this.looseFocus = function ($event, $scope, form) {
        var fieldName = $($event.target).attr('name');
        $scope.showError = false;
        $scope.validateErrorMsg = '';

        // check required rule
        if (form[ fieldName ].$error.required) {
            $scope.showError = true;
            $scope.validateErrorMsg = [$scope.validateErrorMsg, $scope.requiredFields[fieldName].describeName + ' is required.'].join(' ');
            $("input[name=" + fieldName + "]").addClass('invalid');
        } else {
            $("input[name=" + fieldName + "]").removeClass('invalid');

            // mail input have values but not correct.
            if (!form.mail)
                return;

            if (form.mail.$dirty && form.mail.$invalid) {
                $scope.showError = true;
                $scope.validateErrorMsg = "Email address is invalid";
                $("input[name='mail']").addClass('invalid');
            } else if (form.mail.$valid) {
                $("input[name='mail']").removeClass('invalid');
            }
        }

        if (fieldName === 'confirmPassword') {
            $scope.matchPasswords = self.matchPasswords($scope);
        }
    };

    /**
     * @param {Object} $scope
     *   @key {String} firstName
     *   @key {String} lastName;
     *
     **/

    this.getFullName = function ($scope) {
        var fullName = '';
        if ($scope.firstName)
            fullName += $scope.firstName;

        if ($scope.lastName) {
            if (fullName)
                fullName += ' ';

            fullName += $scope.lastName;
        }
        return fullName;
    };

    /**
     * @param {String} boundary
     * @param {Array} of {Object} data
     *   @item {Object) item
     *      @key {Array} of {String} headers
     *      @key {String} data
     */

    this.generateMultipartPayload = function (boundary, data) {
        var msg = '';
        _.forEach(data, function (item) {
            msg += '--' + boundary + '\r\n';
            _.forEach(item.headers, function (header) {
                msg += header + '\r\n';
            });

            msg += '\r\n' + item.data + '\r\n';
        });

        msg += '--' + boundary + '--';

        $log.debug('formUtils service::generateMultipartPayload:: \n' + msg);
        return msg;
    };
}]);

})();
