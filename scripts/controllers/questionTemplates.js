/**
 * Created by Kanthi on 26/08/2015.
 */
var app = angular.module('validateItUserPortalApp');

app.controller('QuestionTemplateCtrl', ['$scope', 'questionTemplateService', function($scope, $location, $questionTemplateService) {

  $scope.templateDescription = $scope.questionTemplateText;
  $scope.questionTemplateText = "<h1 style=\"color:#389BD2\">Name Test Template</h1><p><b>Gender:</b></p><ul><li>- Male</li><li>- Female</li></ul> " +
    "<p><b>Age Groups:</b><ul><li> - 18-24</li><li> - 25-34</li><li> - 35-44</li><li> - 45-54</li><li> - 55-64</li><li> - 65+</li></ul></p>" +
    "<p><b>Region:</b></p><ul><li>- USA</li></ul>" + "<br>" + "<p>MAIN QUESTIONNAIRE</p>"
    + "<br>" + "<p><b>[Q1]   Which of the following do you currently use to invest your money(Select all that apply)</b></p>" + "<br>" +
    "<p><b>[Randomized]</b></p>"  + "<ul><li>1. Self-Directed/Online Brokerage</li><li>2. Full service investment broker</li>" +
    "<li>3. Local bank branch(with or without advisor)</li><li>4. Private Bank</li><li>5. Insurance company</li><li>6. None of the above[Anchor]</li></ul>"
    + "<br>" + "<p><b>[Q2]   What is the total value of your investments(cash, deposits, RRSPs/RRIFs/TFSAs,bonds,stocks and mutual funds etc., but excluding real estate) at all " +
    "institutions</b></p>" + "<br>" + "<p>[Display In order]</p>" + "<p><ul><li>1.   Less than $50,000</li><li>2.   $50,000 to under $100,000</li>" +
    "<li>3.   $100,000 to under $250,000</li>" + "<li>4.   $250,000 to under $500,000</li>" +  "<li>5.    $500,000 to under $1 million</li>" +
    "<li>6.    $1 million and over</li>" + "<li>7.   Prefer not to answer</li>" + "</ul></p>"  +
    "<br>" + "<p><b>[Q3]   How much do you contribute annually to your investments?</b></p>" + "<br>" + "<p>[Display in order]</p>"
    + "<ul><li>1.   Under $10,000</li>" + "<li>2.   $10,000 to under $25,000</li>" + "<li>3.    $25,000 to under $50,000</li>"
    + "<li>4.   $50,000 to under $75,000</li>" + "<li>5.   $75,000 to under $100,000</li>" + "<li>6.   $100,000 and over</li>"
    + "<li>7.   Prefer not to answer</li>" + "</ul>"
    + "<br>" + "<p><b>[Q4]  Based on the video you just watched, what most appeals to you about this service? (Select one)</b></p>" + "<br>" +
    "<p>[Randomize]</p><p><ul><li>1. Little to no effort on my behalf<li>2. Low cost</li><li>3. Professionally managed</li>" +
    "<li>4. Transparent – info accessible all the time</li>" + "<li>5. Portfolio of ETFs</li>" + "<li>6. Personalized to meet your objectives</li>" +
    "<li>7. It does not appeal to me [Anchor]</li>" + "</ul></p>";

  $scope.questionTemplateHover = function(templateType) {
    console.log("Question Template mouse over");

    for(var i = 0; i < $scope.questionTemplates.length; i++) {
      if(templateType.toUpperCase() === $scope.questionTemplates[i].code) {
        $scope.templateDescription = $scope.questionTemplates[i].description;
      }
    }
    //if(templateType == 'nt') {
    //  $scope.templateDescription = "Measure the appeal of the name,clarity,fit to the product and understanding based on the name along with the intent to buy the product with his name";
    //} else if(templateType == 'pt') {
    //
    //}
  };

  $scope.showEditTemplateFlag = false;

  $scope.templateClicked = function(templateCode) {
    $scope.showEditTemplateFlag = true;
    for(var i = 0; i < $scope.questionTemplates.length; i++) {
      if(templateCode.toUpperCase() === $scope.questionTemplates[i].code) {
        $scope.questionTemplateText = $scope.questionTemplates[i].questionTemplateText;
        $scope.questionTemplates[i].selected = true;
      } else {
        $scope.questionTemplates[i].selected = false;
      }
    }
  }
  $scope.questionTemplateLeave = function() {
   // $scope.templateDescription = "";
  }

  $scope.questionTemplates = [
    {
      code: "NT",
      name: "Name Test",
      description: "Measure the appeal of the name,clarity,fit to the product and understanding based on the name along with the intent to buy the product with his name.",
      selected: true,
      questionTemplateText: "<h1 style=\"color:#389BD2\">Name Test Template</h1><p><b>Gender:</b></p><ul><li>- Male</li><li>- Female</li></ul> " +
  "<p><b>Age Groups:</b><ul><li> - 18-24</li><li> - 25-34</li><li> - 35-44</li><li> - 45-54</li><li> - 55-64</li><li> - 65+</li></ul></p>" +
  "<p><b>Region:</b></p><ul><li>- USA</li></ul>" + "<br>" + "<p>MAIN QUESTIONNAIRE</p>"
  + "<br>" + "<p><b>[Q1]   Which of the following do you currently use to invest your money(Select all that apply)</b></p>" + "<br>" +
  "<p><b>[Randomized]</b></p>"  + "<ul><li>1. Self-Directed/Online Brokerage</li><li>2. Full service investment broker</li>" +
  "<li>3. Local bank branch(with or without advisor)</li><li>4. Private Bank</li><li>5. Insurance company</li><li>6. None of the above[Anchor]</li></ul>"
  + "<br>" + "<p><b>[Q2]   What is the total value of your investments(cash, deposits, RRSPs/RRIFs/TFSAs,bonds,stocks and mutual funds etc., but excluding real estate) at all " +
  "institutions</b></p>" + "<br>" + "<p>[Display In order]</p>" + "<p><ul><li>1.   Less than $50,000</li><li>2.   $50,000 to under $100,000</li>" +
  "<li>3.   $100,000 to under $250,000</li>" + "<li>4.   $250,000 to under $500,000</li>" +  "<li>5.    $500,000 to under $1 million</li>" +
  "<li>6.    $1 million and over</li>" + "<li>7.   Prefer not to answer</li>" + "</ul></p>"  +
  "<br>" + "<p><b>[Q3]   How much do you contribute annually to your investments?</b></p>" + "<br>" + "<p>[Display in order]</p>"
  + "<ul><li>1.   Under $10,000</li>" + "<li>2.   $10,000 to under $25,000</li>" + "<li>3.    $25,000 to under $50,000</li>"
  + "<li>4.   $50,000 to under $75,000</li>" + "<li>5.   $75,000 to under $100,000</li>" + "<li>6.   $100,000 and over</li>"
  + "<li>7.   Prefer not to answer</li>" + "</ul>"
  + "<br>" + "<p><b>[Q4]  Based on the video you just watched, what most appeals to you about this service? (Select one)</b></p>" + "<br>" +
  "<p>[Randomize]</p><p><ul><li>1. Little to no effort on my behalf<li>2. Low cost</li><li>3. Professionally managed</li>" +
  "<li>4. Transparent – info accessible all the time</li>" + "<li>5. Portfolio of ETFs</li>" + "<li>6. Personalized to meet your objectives</li>" +
  "<li>7. It does not appeal to me [Anchor]</li>" + "</ul></p>"
    },
    {
      code: "NP",
      name: "New Product Test",
      selected: false,
      description: "Rank your ideas by relevance and uniqueness, credibility and the ability to generate purchase intent.",
      questionTemplateText: "<h1 style=\"color:#389BD2\">New Product Test Template</h1><p><b>Gender:</b></p><ul><li>- Male</li><li>- Female</li></ul> " +
      "<p><b>Age Groups:</b><ul><li> - 18-24</li><li> - 25-34</li><li> - 35-44</li><li> - 45-54</li><li> - 55-64</li><li> - 65+</li></ul></p>" +
      "<p><b>Region:</b></p><ul><li>- USA</li></ul>" + "<br>" + "<p>MAIN QUESTIONNAIRE</p>"
      + "<br>" + "<p><b>[Q1]   Which of the following do you currently use to invest your money(Select all that apply)</b></p>" + "<br>" +
      "<p><b>[Randomized]</b></p>"  + "<ul><li>1. Self-Directed/Online Brokerage</li><li>2. Full service investment broker</li>" +
      "<li>3. Local bank branch(with or without advisor)</li><li>4. Private Bank</li><li>5. Insurance company</li><li>6. None of the above[Anchor]</li></ul>"
      + "<br>" + "<p><b>[Q2]   What is the total value of your investments(cash, deposits, RRSPs/RRIFs/TFSAs,bonds,stocks and mutual funds etc., but excluding real estate) at all " +
      "institutions</b></p>" + "<br>" + "<p>[Display In order]</p>" + "<p><ul><li>1.   Less than $50,000</li><li>2.   $50,000 to under $100,000</li>" +
      "<li>3.   $100,000 to under $250,000</li>" + "<li>4.   $250,000 to under $500,000</li>" +  "<li>5.    $500,000 to under $1 million</li>" +
      "<li>6.    $1 million and over</li>" + "<li>7.   Prefer not to answer</li>" + "</ul></p>"  +
      "<br>" + "<p><b>[Q3]   How much do you contribute annually to your investments?</b></p>" + "<br>" + "<p>[Display in order]</p>"
      + "<ul><li>1.   Under $10,000</li>" + "<li>2.   $10,000 to under $25,000</li>" + "<li>3.    $25,000 to under $50,000</li>"
      + "<li>4.   $50,000 to under $75,000</li>" + "<li>5.   $75,000 to under $100,000</li>" + "<li>6.   $100,000 and over</li>"
      + "<li>7.   Prefer not to answer</li>" + "</ul>"
      + "<br>" + "<p><b>[Q4]  Based on the video you just watched, what most appeals to you about this service? (Select one)</b></p>" + "<br>" +
      "<p>[Randomize]</p><p><ul><li>1. Little to no effort on my behalf<li>2. Low cost</li><li>3. Professionally managed</li>" +
      "<li>4. Transparent – info accessible all the time</li>" + "<li>5. Portfolio of ETFs</li>" + "<li>6. Personalized to meet your objectives</li>" +
      "<li>7. It does not appeal to me [Anchor]</li>" + "</ul></p>"
    },
    {
      code: "PT",
      name: "Product Benefit Test",
      selected: false,
      description: "Rank product benefits by relevance and uniqueness, credibility and ability to generate purchase intent.",
      questionTemplateText: "<h1 style=\"color:#389BD2\">Product Benefit Test Template</h1><p><b>Gender:</b></p><ul><li>- Male</li><li>- Female</li></ul> " +
      "<p><b>Age Groups:</b><ul><li> - 18-24</li><li> - 25-34</li><li> - 35-44</li><li> - 45-54</li><li> - 55-64</li><li> - 65+</li></ul></p>" +
      "<p><b>Region:</b></p><ul><li>- USA</li></ul>" + "<br>" + "<p>MAIN QUESTIONNAIRE</p>"
      + "<br>" + "<p><b>[Q1]   Which of the following do you currently use to invest your money(Select all that apply)</b></p>" + "<br>" +
      "<p><b>[Randomized]</b></p>"  + "<ul><li>1. Self-Directed/Online Brokerage</li><li>2. Full service investment broker</li>" +
      "<li>3. Local bank branch(with or without advisor)</li><li>4. Private Bank</li><li>5. Insurance company</li><li>6. None of the above[Anchor]</li></ul>"
      + "<br>" + "<p><b>[Q2]   What is the total value of your investments(cash, deposits, RRSPs/RRIFs/TFSAs,bonds,stocks and mutual funds etc., but excluding real estate) at all " +
      "institutions</b></p>" + "<br>" + "<p>[Display In order]</p>" + "<p><ul><li>1.   Less than $50,000</li><li>2.   $50,000 to under $100,000</li>" +
      "<li>3.   $100,000 to under $250,000</li>" + "<li>4.   $250,000 to under $500,000</li>" +  "<li>5.    $500,000 to under $1 million</li>" +
      "<li>6.    $1 million and over</li>" + "<li>7.   Prefer not to answer</li>" + "</ul></p>"  +
      "<br>" + "<p><b>[Q3]   How much do you contribute annually to your investments?</b></p>" + "<br>" + "<p>[Display in order]</p>"
      + "<ul><li>1.   Under $10,000</li>" + "<li>2.   $10,000 to under $25,000</li>" + "<li>3.    $25,000 to under $50,000</li>"
      + "<li>4.   $50,000 to under $75,000</li>" + "<li>5.   $75,000 to under $100,000</li>" + "<li>6.   $100,000 and over</li>"
      + "<li>7.   Prefer not to answer</li>" + "</ul>"
      + "<br>" + "<p><b>[Q4]  Based on the video you just watched, what most appeals to you about this service? (Select one)</b></p>" + "<br>" +
      "<p>[Randomize]</p><p><ul><li>1. Little to no effort on my behalf<li>2. Low cost</li><li>3. Professionally managed</li>" +
      "<li>4. Transparent – info accessible all the time</li>" + "<li>5. Portfolio of ETFs</li>" + "<li>6. Personalized to meet your objectives</li>" +
      "<li>7. It does not appeal to me [Anchor]</li>" + "</ul></p>"
    },
    {
      code: "CT",
      name: "Creative Test",
      selected: false,
      description: "Test your creativity for clarity and relevance, delivering the main idea to the right audience, supporting your brand equity and motivation to buy.",
      questionTemplateText: "<h1 style=\"color:#389BD2\">Creative Test Template</h1><p><b>Gender:</b></p><ul><li>- Male</li><li>- Female</li></ul> " +
      "<p><b>Age Groups:</b><ul><li> - 18-24</li><li> - 25-34</li><li> - 35-44</li><li> - 45-54</li><li> - 55-64</li><li> - 65+</li></ul></p>" +
      "<p><b>Region:</b></p><ul><li>- USA</li></ul>" + "<br>" + "<p>MAIN QUESTIONNAIRE</p>"
      + "<br>" + "<p><b>[Q1]   Which of the following do you currently use to invest your money(Select all that apply)</b></p>" + "<br>" +
      "<p><b>[Randomized]</b></p>"  + "<ul><li>1. Self-Directed/Online Brokerage</li><li>2. Full service investment broker</li>" +
      "<li>3. Local bank branch(with or without advisor)</li><li>4. Private Bank</li><li>5. Insurance company</li><li>6. None of the above[Anchor]</li></ul>"
      + "<br>" + "<p><b>[Q2]   What is the total value of your investments(cash, deposits, RRSPs/RRIFs/TFSAs,bonds,stocks and mutual funds etc., but excluding real estate) at all " +
      "institutions</b></p>" + "<br>" + "<p>[Display In order]</p>" + "<p><ul><li>1.   Less than $50,000</li><li>2.   $50,000 to under $100,000</li>" +
      "<li>3.   $100,000 to under $250,000</li>" + "<li>4.   $250,000 to under $500,000</li>" +  "<li>5.    $500,000 to under $1 million</li>" +
      "<li>6.    $1 million and over</li>" + "<li>7.   Prefer not to answer</li>" + "</ul></p>"  +
      "<br>" + "<p><b>[Q3]   How much do you contribute annually to your investments?</b></p>" + "<br>" + "<p>[Display in order]</p>"
      + "<ul><li>1.   Under $10,000</li>" + "<li>2.   $10,000 to under $25,000</li>" + "<li>3.    $25,000 to under $50,000</li>"
      + "<li>4.   $50,000 to under $75,000</li>" + "<li>5.   $75,000 to under $100,000</li>" + "<li>6.   $100,000 and over</li>"
      + "<li>7.   Prefer not to answer</li>" + "</ul>"
      + "<br>" + "<p><b>[Q4]  Based on the video you just watched, what most appeals to you about this service? (Select one)</b></p>" + "<br>" +
      "<p>[Randomize]</p><p><ul><li>1. Little to no effort on my behalf<li>2. Low cost</li><li>3. Professionally managed</li>" +
      "<li>4. Transparent – info accessible all the time</li>" + "<li>5. Portfolio of ETFs</li>" + "<li>6. Personalized to meet your objectives</li>" +
      "<li>7. It does not appeal to me [Anchor]</li>" + "</ul></p>"
    },
    {
      code: "MT",
      name: "Messaging Test",
      selected: false,
      description: "Test your ads with a variety of messages and go ahead with the most believable message which is relevant to your target and which can differentiate you from competition.",
      questionTemplateText: "<h1 style=\"color:#389BD2\">Messaging Test Template</h1><p><b>Gender:</b></p><ul><li>- Male</li><li>- Female</li></ul> " +
      "<p><b>Age Groups:</b><ul><li> - 18-24</li><li> - 25-34</li><li> - 35-44</li><li> - 45-54</li><li> - 55-64</li><li> - 65+</li></ul></p>" +
      "<p><b>Region:</b></p><ul><li>- USA</li></ul>" + "<br>" + "<p>MAIN QUESTIONNAIRE</p>"
      + "<br>" + "<p><b>[Q1]   Which of the following do you currently use to invest your money(Select all that apply)</b></p>" + "<br>" +
      "<p><b>[Randomized]</b></p>"  + "<ul><li>1. Self-Directed/Online Brokerage</li><li>2. Full service investment broker</li>" +
      "<li>3. Local bank branch(with or without advisor)</li><li>4. Private Bank</li><li>5. Insurance company</li><li>6. None of the above[Anchor]</li></ul>"
      + "<br>" + "<p><b>[Q2]   What is the total value of your investments(cash, deposits, RRSPs/RRIFs/TFSAs,bonds,stocks and mutual funds etc., but excluding real estate) at all " +
      "institutions</b></p>" + "<br>" + "<p>[Display In order]</p>" + "<p><ul><li>1.   Less than $50,000</li><li>2.   $50,000 to under $100,000</li>" +
      "<li>3.   $100,000 to under $250,000</li>" + "<li>4.   $250,000 to under $500,000</li>" +  "<li>5.    $500,000 to under $1 million</li>" +
      "<li>6.    $1 million and over</li>" + "<li>7.   Prefer not to answer</li>" + "</ul></p>"  +
      "<br>" + "<p><b>[Q3]   How much do you contribute annually to your investments?</b></p>" + "<br>" + "<p>[Display in order]</p>"
      + "<ul><li>1.   Under $10,000</li>" + "<li>2.   $10,000 to under $25,000</li>" + "<li>3.    $25,000 to under $50,000</li>"
      + "<li>4.   $50,000 to under $75,000</li>" + "<li>5.   $75,000 to under $100,000</li>" + "<li>6.   $100,000 and over</li>"
      + "<li>7.   Prefer not to answer</li>" + "</ul>"
      + "<br>" + "<p><b>[Q4]  Based on the video you just watched, what most appeals to you about this service? (Select one)</b></p>" + "<br>" +
      "<p>[Randomize]</p><p><ul><li>1. Little to no effort on my behalf<li>2. Low cost</li><li>3. Professionally managed</li>" +
      "<li>4. Transparent – info accessible all the time</li>" + "<li>5. Portfolio of ETFs</li>" + "<li>6. Personalized to meet your objectives</li>" +
      "<li>7. It does not appeal to me [Anchor]</li>" + "</ul></p>"
    },
    {
      code: "VT",
      name: "Video Test",
      selected: false,
      description: "Measure variations of your videos for clarity and persuasion. Compare to successful videos you had in the market before.",
      questionTemplateText: "<h1 style=\"color:#389BD2\">Video Test Template</h1><p><b>Gender:</b></p><ul><li>- Male</li><li>- Female</li></ul> " +
      "<p><b>Age Groups:</b><ul><li> - 18-24</li><li> - 25-34</li><li> - 35-44</li><li> - 45-54</li><li> - 55-64</li><li> - 65+</li></ul></p>" +
      "<p><b>Region:</b></p><ul><li>- USA</li></ul>" + "<br>" + "<p>MAIN QUESTIONNAIRE</p>"
      + "<br>" + "<p><b>[Q1]   Which of the following do you currently use to invest your money(Select all that apply)</b></p>" + "<br>" +
      "<p><b>[Randomized]</b></p>"  + "<ul><li>1. Self-Directed/Online Brokerage</li><li>2. Full service investment broker</li>" +
      "<li>3. Local bank branch(with or without advisor)</li><li>4. Private Bank</li><li>5. Insurance company</li><li>6. None of the above[Anchor]</li></ul>"
      + "<br>" + "<p><b>[Q2]   What is the total value of your investments(cash, deposits, RRSPs/RRIFs/TFSAs,bonds,stocks and mutual funds etc., but excluding real estate) at all " +
      "institutions</b></p>" + "<br>" + "<p>[Display In order]</p>" + "<p><ul><li>1.   Less than $50,000</li><li>2.   $50,000 to under $100,000</li>" +
      "<li>3.   $100,000 to under $250,000</li>" + "<li>4.   $250,000 to under $500,000</li>" +  "<li>5.    $500,000 to under $1 million</li>" +
      "<li>6.    $1 million and over</li>" + "<li>7.   Prefer not to answer</li>" + "</ul></p>"  +
      "<br>" + "<p><b>[Q3]   How much do you contribute annually to your investments?</b></p>" + "<br>" + "<p>[Display in order]</p>"
      + "<ul><li>1.   Under $10,000</li>" + "<li>2.   $10,000 to under $25,000</li>" + "<li>3.    $25,000 to under $50,000</li>"
      + "<li>4.   $50,000 to under $75,000</li>" + "<li>5.   $75,000 to under $100,000</li>" + "<li>6.   $100,000 and over</li>"
      + "<li>7.   Prefer not to answer</li>" + "</ul>"
      + "<br>" + "<p><b>[Q4]  Based on the video you just watched, what most appeals to you about this service? (Select one)</b></p>" + "<br>" +
      "<p>[Randomize]</p><p><ul><li>1. Little to no effort on my behalf<li>2. Low cost</li><li>3. Professionally managed</li>" +
      "<li>4. Transparent – info accessible all the time</li>" + "<li>5. Portfolio of ETFs</li>" + "<li>6. Personalized to meet your objectives</li>" +
      "<li>7. It does not appeal to me [Anchor]</li>" + "</ul></p>"
    },
    {
      code: "IT",
      name: "Incentive Test",
      selected: false,
      description: "Rank your ideas for incentives by relevance, clarity and ability to generate purchase intent.",
      questionTemplateText: "<h1 style=\"color:#389BD2\">Incentive Test Template</h1><p><b>Gender:</b></p><ul><li>- Male</li><li>- Female</li></ul> " +
      "<p><b>Age Groups:</b><ul><li> - 18-24</li><li> - 25-34</li><li> - 35-44</li><li> - 45-54</li><li> - 55-64</li><li> - 65+</li></ul></p>" +
      "<p><b>Region:</b></p><ul><li>- USA</li></ul>" + "<br>" + "<p>MAIN QUESTIONNAIRE</p>"
      + "<br>" + "<p><b>[Q1]   Which of the following do you currently use to invest your money(Select all that apply)</b></p>" + "<br>" +
      "<p><b>[Randomized]</b></p>"  + "<ul><li>1. Self-Directed/Online Brokerage</li><li>2. Full service investment broker</li>" +
      "<li>3. Local bank branch(with or without advisor)</li><li>4. Private Bank</li><li>5. Insurance company</li><li>6. None of the above[Anchor]</li></ul>"
      + "<br>" + "<p><b>[Q2]   What is the total value of your investments(cash, deposits, RRSPs/RRIFs/TFSAs,bonds,stocks and mutual funds etc., but excluding real estate) at all " +
      "institutions</b></p>" + "<br>" + "<p>[Display In order]</p>" + "<p><ul><li>1.   Less than $50,000</li><li>2.   $50,000 to under $100,000</li>" +
      "<li>3.   $100,000 to under $250,000</li>" + "<li>4.   $250,000 to under $500,000</li>" +  "<li>5.    $500,000 to under $1 million</li>" +
      "<li>6.    $1 million and over</li>" + "<li>7.   Prefer not to answer</li>" + "</ul></p>"  +
      "<br>" + "<p><b>[Q3]   How much do you contribute annually to your investments?</b></p>" + "<br>" + "<p>[Display in order]</p>"
      + "<ul><li>1.   Under $10,000</li>" + "<li>2.   $10,000 to under $25,000</li>" + "<li>3.    $25,000 to under $50,000</li>"
      + "<li>4.   $50,000 to under $75,000</li>" + "<li>5.   $75,000 to under $100,000</li>" + "<li>6.   $100,000 and over</li>"
      + "<li>7.   Prefer not to answer</li>" + "</ul>"
      + "<br>" + "<p><b>[Q4]  Based on the video you just watched, what most appeals to you about this service? (Select one)</b></p>" + "<br>" +
      "<p>[Randomize]</p><p><ul><li>1. Little to no effort on my behalf<li>2. Low cost</li><li>3. Professionally managed</li>" +
      "<li>4. Transparent – info accessible all the time</li>" + "<li>5. Portfolio of ETFs</li>" + "<li>6. Personalized to meet your objectives</li>" +
      "<li>7. It does not appeal to me [Anchor]</li>" + "</ul></p>"
    },
    {
      code: "N",
      name: "New Template - 1",
      selected: false,
      description: "New",
      questionTemplateText: "<h1 style=\"color:#389BD2\">New Template</h1> <p><b>[Q1] Do you currently live in the following cities?</b></p>" + "<br>" +
      "<p>[Randomize]</p><p><ul><li>1. Chula Vista<li>2. Los Gatos</li><li>3. Sunnyvale</li><li>4. San Francisco</li>" +
      "<li>5. Escondido</li>" + "<li>5. Downey</li>" + "</ul></p>"
      + "<p><b>[Q2] What type of products do you mostly shop for online?</b></p>" + "<br>" +
      "<p>[Randomize]</p><p><ul><li>1. Household items<li>2. Food</li><li>3. Apparel</li><li>4. Furniture</li>" +
      "<li>5. Electronics</li>" + "<li>5. other</li>" + "</ul></p>" +
      "<p><b>[Q3] What is your favorite ecommerce site?</b></p>" + "<br>" +
      "<p>[Randomize]</p><p><ul><li>1. amazon.com<li>2. walmart.com</li><li>3. target.com</li><li>4. shopify.com</li>" +
      "<li>5. ebay.com</li>" + "<li>5. other,please specify</li>" + "</ul></p>" +
      "<p><b>[Q4] What social media do you use(select all that apply)?</b></p>" + "<br>" +
      "<p></p><p><ul><li>1. facebook<li>2. instagram</li><li>3. twitter</li><li>4. linkedin</li>" +
      "<li>5. tumblr</li>" + "</ul></p>" +
      "<p><b>[Q5] Would any of the below incentives intice you to use your visa more when buying online?</b></p>" + "<br>" +
      "<p></p><p><ul><li>1. a loyalty program(earn points for free merchandise)<li>2. get cash back</li><li>3. discounts on check out</li><li>4. discounts on next purchase</li>" +
      "<li>5. travel rewards</li>" + "</ul></p>"
    }

  ]
}]);
