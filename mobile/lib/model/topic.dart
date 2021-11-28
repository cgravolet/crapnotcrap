import 'package:crapnotcrap/model/topic_option.dart';
import 'package:crapnotcrap/model/user.dart';

class Topic {
  String subject;
  String title;
  int forumId;
  int topicId;
  int replies;
  int views;
  int votes;
  DateTime topicDateTime;
  User user;
  List<TopicOption>? polls;

  Topic(
    this.topicId,
    this.forumId,
    this.title,
    this.topicDateTime,
    this.user,
    this.subject, [
    this.replies = 0,
    this.views = 0,
    this.votes = 0,
    this.polls,
  ]);

  static List<Topic> mock = [
    Topic(
        69814,
        28,
        'Thunderdome: Year in Music, 1991 vs 1993',
        DateTime(2021, 11, 24, 11, 16),
        User(40748, 'kicker_of_elves'),
        'Thunderdome: Year in Music',
        16,
        463,
        6, [
      TopicOption('1991', 5),
      TopicOption('1993', 1),
    ]),
    Topic(
        69804,
        28,
        'Guitar quadrangular fight - Tele vs. Strat vs SG vs. Les Paul',
        DateTime(2021, 11, 20, 18, 29),
        User(40804, 'boilermaker'),
        'Tele vs. Strat vs SG vs. Les Paul',
        44,
        988,
        35, [
      TopicOption('Telecaster', 13),
      TopicOption('Stratocaster', 9),
      TopicOption('SG', 8),
      TopicOption('Les Paul', 5),
    ]),
    Topic(69811, 28, 'Les Paul (the guitar)', DateTime(2021, 11, 23, 13, 50),
        User(40785, 'Garth'), 'Les Paul Guitars?', 20, 481, 13, [
      TopicOption('Swami', 12),
      TopicOption('Slash', 1),
    ]),
    Topic(69815, 28, 'Carl Jung', DateTime(2021, 11, 24, 17, 9, 27),
        User(40816, 'biscuitdough'), 'Carl Jung', 9, 226, 12, [
      TopicOption('Not crap', 6),
      TopicOption('Crap because magic', 4),
      TopicOption('Crap because psychoanalysis', 2),
    ]),
    Topic(
        69812,
        28,
        'Band: Lee Bains and the Glory Fires',
        DateTime(2021, 11, 23, 17, 22),
        User(40202, 'dontfeaththeringo'),
        'The Glory Fires',
        1,
        110,
        2, [
      TopicOption('Not Crap', 2),
      TopicOption('Crap', 0),
    ]),
    Topic(69816, 28, 'Band: Rival Sons', DateTime(2021, 11, 24, 12, 24),
        User(40202, 'dontfeaththeringo'), 'Band: Rival Songs', 5, 179, 6, [
      TopicOption('Greta Van Fart (Crap)', 5),
      TopicOption('Retread Zeppelin (Not Crap)', 1),
    ]),
    Topic(
        69807,
        28,
        'Some british punkish bands from the late seventies',
        DateTime(2021, 11, 21, 15, 39),
        User(40925, 'Vibracobra'),
        'Choose one',
        20,
        553,
        28, [
      TopicOption('Wire', 13),
      TopicOption('Joy Division', 8),
      TopicOption('Gang of Four', 4),
      TopicOption('Magazine', 2),
      TopicOption('Killing Joke', 1),
    ]),
    Topic(
        69773,
        28,
        'Rock and roll instrument: Organ',
        DateTime(2021, 11, 10, 9, 44),
        User(40816, 'biscuitdough'),
        'Does the organ, as an instrument, rock?',
        66,
        1599,
        25, [
      TopicOption('Yes, the organ does rock', 24),
      TopicOption('No, the organ does not rock', 1),
    ])
  ];
}
