(function() {
    'use strict';
    angular
        .module('dotrips')
        .component('roomSelection', {
            templateUrl: 'index.html',
            controller: RoomSelectionController,
            bindings: {
                data: '=',
                skipThisStep: '<',
                actionType: '='
            },

            controllerAs: 'roomSelectionCtrl'
        });
    /** @ngInject */
    function RoomSelectionController($state, $scope, SharedDataService, TripPlannerService, TripPlannerFactory) {

        var vm = this;
        var roomModal = TripPlannerService.roomModal;


        /**
         * Initial data
         */
        function init() {
            vm.tripData = vm.data;
			vm.rooms = vm.tripData.rooms || [];

            if(vm.tripData.rooms.length > 1 || vm.rooms[0].adultCount !== vm.tripData.adultCount || vm.rooms[0].childCount !== vm.tripData.childCount){
            	console.log(vm.rooms);
            	vm.rooms[0].adultCount = vm.tripData.adultCount;
            	vm.rooms[0].childCount = vm.tripData.childCount;

				if(vm.tripData.rooms.length > 1){
					vm.tripData.rooms.splice(1)
				}
				console.log("Trip Data:",vm.tripData);
			}

            vm.remainingAdultCount = 0;
            vm.remainingChildCount = 0;
			vm.errorWhilePlanMyTrip = {
				adult: false,
				child: false,
				min_adult: false
			};

            // if (vm.rooms[0]) {
            //     vm.rooms[0].adultCount = vm.tripData.adultCount;
            //     vm.rooms[0].childCount = vm.tripData.childCount;
            // }
            // roomModal = TripPlannerService.defaultDataModal;

            console.log("add room", vm.tripData);
        }
        init();

        /**
         * Add New Rooms (not more then 5)
         */
        vm.addAnotherRoom = function(data) {
			resetErrorMessage('ADDROOM');
            if (vm.rooms.length < 5) {
				roomModal.adultCount = vm.remainingAdultCount;
				roomModal.childCount = vm.remainingChildCount;
				vm.remainingAdultCount = vm.remainingChildCount = 0;
                vm.rooms.push(angular.copy(roomModal));
            }
        };

        /**
         * Remove room from the last
         */
        vm.removeRoom = function(data, index) { //data is Array of All Room
			console.log("Data is: ",data);
			console.log(data[index]);
			resetErrorMessage('REMOVEROOM');
        	vm.remainingAdultCount += data[index].adultCount; //Minus for index starting from 0
        	vm.remainingChildCount += data[index].childCount;
            data.splice(index);
        };

        /**
         * Increanment and decreanment of Adult Count
         */
        vm.updateAdultCount = function(data, state) {
        	resetErrorMessage('ADULT');
            switch (state) {
                case 'increase':
                	if(vm.remainingAdultCount > 0 && data.adultCount < 9){
						++data.adultCount;
						--vm.remainingAdultCount;
					}
                    break;
                case 'decrease':
                    data.adultCount > 1 ? (--data.adultCount,++vm.remainingAdultCount) : data.adultCount;
                    break;
                default:
                    break;
            }
			console.log("Room Count and State is Remaining: ",data,state,vm.remainingChildCount,vm.remainingAdultCount);
        };

        /**
         * Increanment and decreanment of child count
         */
        vm.updateChildCount = function(data, state) {
			resetErrorMessage('CHILD');
            switch (state) {
                case 'increase':
                	if(vm.remainingChildCount > 0 && data.adultCount < 9){
                		++data.childCount;
                		--vm.remainingChildCount;
					}
                    break;
                case 'decrease':
                    data.childCount > 0 ? (--data.childCount, ++vm.remainingChildCount ): data.childCount;
                    break;
                default:
                    break;
            }
			console.log("Room Count and State is Remaining: ",data,state,vm.remainingChildCount,vm.remainingAdultCount);
        };

        /**
         * Child age label
         */
        vm.childLabel = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth'];

        /**
         * Selecting child range
         */
        vm.childAgeRange = function(room, age, index) {
            // console.log("room", room);
            room.ages[age] = index;

        };

        /**
         * Selecting senior age range
         */
        vm.selectSeniorAgeRange = function(roomCount, index) {
            roomCount.seniorAgeRange = index + 1;
            console.log("vm.tripData", vm.tripData)
        };

        /*Remove All Error Message From Page*/
        function resetErrorMessage(type,val) {
        	switch(type){
				case 'ADULT':
					vm.errorWhilePlanMyTrip.adult = val? val: false;
					vm.errorWhilePlanMyTrip.min_adult = false;
					break;
				case 'CHILD':
					vm.errorWhilePlanMyTrip.child = val?val: false;
					break;
				// case 'ADDROOM':
				// case 'REMOVEROOM':
				// 	break;
				default:
					vm.errorWhilePlanMyTrip.child = val?val: false;
					vm.errorWhilePlanMyTrip.adult = val? val: false;
					vm.errorWhilePlanMyTrip.min_adult = false;
					break;
			}
		}


        /**
         * Clicking on plan my trip button
         */
        vm.planMyTrip = function() {

			if(validateRooms()){

				$state.go('home.tripPlanner.destination.default', {
					index: '1'
				});
				vm.tripData.bookingType = "hotel";

				//Setting value on storage
				SharedDataService.manageTripDataToLocalStorage.set(vm.tripData);
			}
        };

        vm.loadHotelList = function() {
        	if(validateRooms()){
				vm.tripData.bookingType = "hotel";
				//Setting value on storage
				SharedDataService.manageTripDataToLocalStorage.set(vm.tripData);
			}
        };

        vm.skipMyTrip = function() {
            $state.go('home.tripPlanner.destination.default', {
                index: '1'
            });
            vm.tripData.bookingType = "experience";
        };


        /*Validate Data For Rooms*/
		function validateRooms() {
			vm.errorWhilePlanMyTrip.adult = Boolean(vm.remainingAdultCount);
			vm.errorWhilePlanMyTrip.child = Boolean(vm.remainingChildCount);
			vm.errorWhilePlanMyTrip.min_adult = Boolean(vm.rooms[vm.rooms.length-1].adultCount == 0);
			return (!(vm.errorWhilePlanMyTrip.adult || vm.errorWhilePlanMyTrip.child || vm.errorWhilePlanMyTrip.min_adult));
		}
    }
})();
