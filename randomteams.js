/**
 * @Author: John Isaacs <john>
 * @Date:   14-Jun-182018
 * @Filename: randomteams.js
 * @Last modified by:   john
 * @Last modified time: 14-Jun-182018
 */
var center = require('center-align');
var clear = require('clear');

function generate(){
  //var referee = 'John';
  var peeps =
  [
  'Carlos',
  'Rob',
  'John I',
  'Andrei',
  'David L',
  'Roger',
  'Mark',
  'Yang',
  'Shona',
  'Chris Mc',
  'Stewart',
  'Steven',
  'Scott',
  'lynsey',
  'Bill',
  'Mogu',
  'Virginia',
  'Ines',
  'Ian Bell',
  'Susan',
  'Ben',
  'Pamela',
  'Kyle',
  'Joe',
  'Beth',
  'Virginia2',
  'Colin',
  'Davids Mum',
  'Comp Soc',
  'Pam I',
  'Andreis Mum',
  'John M' ];


  var teamNames = [
'Russia',       'Saudi Arabia',        'Egypt',          'Uruguay',
'Portugal',     'Spain',                'Morocco',        'Iran',
'France',       'Australia',            'Peru',           'Denmark',
'Argentina',    'Iceland',              'Croatia',        'Nigeria',
'Brazil',       'Switzerland',         'Costa Rica',     'Serbia',
'Germany',      'Mexico',               'Sweden',         'South Korea',
'Belgium',      'Panama',               'Tunisia',        'England',
'Poland',      'Senegal',              'Colombia',       'Japan'
  clear();
  var teams = {};
  peopleCount = peeps.length;
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************   Welcome to the CSDM World Cup Sweepy Draw 1968   ********************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log(center("********************************************************************************************",93));
  console.log();
  console.log();
  console.log();
  for (var i = 0; i < peopleCount; i++){
    var randomPeepIndex = Math.floor(Math.random()*(peeps.length - 1));
    peep = peeps.splice(randomPeepIndex, 1)[0];

    var randomTeamIndex = Math.floor(Math.random()*(teamNames.length - 1));
    team = teamNames.splice(randomTeamIndex, 1)[0];


    console.log();
    console.log();
    console.log();
    console.log(center("********************   " + "Draw "+(i+1) + "   ********************",93));
    var waitTill = new Date(new Date().getTime() + 2 * 2000);
    while(waitTill > new Date()){}
    console.log('\x1b[1m',center("********************   " + peep + "   ********************",93));
    waitTill = new Date(new Date().getTime() + 2 * 2000);
    while(waitTill > new Date()){}
    console.log('\x1b[0m \x1b[5m',center("********************   " + team + "   ********************",93));
    waitTill = new Date(new Date().getTime() + 1 * 1000);
    while(waitTill > new Date()){}
    console.log();
    console.log();
    console.log();
    console.log('\x1b[0m',center("********************   Next Draw In   ********************",93));
    console.log(center("3",93));
    waitTill = new Date(new Date().getTime() + 1 * 1000);
    while(waitTill > new Date()){}
    console.log(center("2",93));
    waitTill = new Date(new Date().getTime() + 1 * 1000);
    while(waitTill > new Date()){}
    console.log(center("1",93));
    waitTill = new Date(new Date().getTime() + 2 * 1000);
    while(waitTill > new Date()){}

  }
  //return teams;
}

doWork();
