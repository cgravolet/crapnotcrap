import 'package:flutter/material.dart';
import 'package:crapnotcrap/model/topic.dart';
import 'package:crapnotcrap/topic_cell.dart';
import 'package:crapnotcrap/topic_detail.dart';

class TopicList extends StatelessWidget {
  const TopicList({Key? key, required this.topics}) : super(key: key);

  final List<Topic> topics;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: topics.length,
      itemBuilder: (BuildContext context, int index) {
        final topic = topics[index];
        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) {
                  return TopicDetail(topic: topic);
                },
              ),
            );
          },
          child: TopicCell(topic: topic),
        );
      },
    );
  }
}
