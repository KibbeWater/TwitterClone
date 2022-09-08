// When .searchbar__input is focused we wanna give searchbar a new class searchbar__active using jQuery

$(document).ready(function () {
	console.log($('.searchbar__input'));
	$('.searchbar__input').focus(function () {
		$('.searchbar').addClass('searchbar__active');
		$('.searchbar__input').addClass('searchbar__input__active');
	});
	$('.searchbar__input').blur(function () {
		$('.searchbar').removeClass('searchbar__active');
		$('.searchbar__input').removeClass('searchbar__input__active');
	});
});
