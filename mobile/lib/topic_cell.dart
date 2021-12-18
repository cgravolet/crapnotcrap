import 'package:flutter/material.dart';
import 'package:crapnotcrap/model/topic.dart';
import 'package:crapnotcrap/topic_cell_option.dart';

class TopicCell extends StatelessWidget {
  const TopicCell({required this.topic, Key? key}) : super(key: key);

  final Topic topic;

  @override
  Widget build(BuildContext context) {
    final topVotes = topic.polls
        ?.map((e) => e.votes)
        .reduce((value, element) => element > value ? element : value);
    return Card(
      color: Theme.of(context).cardColor,
      elevation: 2.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Text(
                topic.title,
                style: Theme.of(context).textTheme.headline2,
              ),
            ),
            if (topic.title != topic.subject)
              Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Text(
                  topic.subject,
                  style: Theme.of(context).textTheme.subtitle1,
                ),
              ),
            if (topic.polls?.isNotEmpty == true)
              Wrap(
                runSpacing: 4.0,
                children: [
                  for (var poll in topic.polls ?? [])
                    TopicCellOption(
                      title: poll.title,
                      votes: poll.votes,
                      totalVotes: topVotes ?? 0,
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
