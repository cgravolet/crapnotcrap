import 'package:flutter/material.dart';
import 'package:crapnotcrap/cnc_theme.dart';
import 'package:crapnotcrap/topic_list.dart';
import 'package:crapnotcrap/model/topic.dart';

void main() {
  runApp(const CrapNotCrapApp());
}

class CrapNotCrapApp extends StatelessWidget {
  const CrapNotCrapApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    const title = 'Crap Not Crap';
    final theme = CNCTheme.dark();
    return MaterialApp(
      title: title,
      theme: theme,
      home: Scaffold(
        appBar: AppBar(
          title: Text(
            title,
            style: theme.textTheme.headline6,
          ),
        ),
        body: SafeArea(
          child: TopicList(topics: Topic.mock),
        ),
      ),
    );
  }
}
