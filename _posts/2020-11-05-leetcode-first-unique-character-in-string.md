---
layout: post
title:  "Leetcode 387. First Unique Character in a String"
author: Edwin
categories: [ Code ]
tags: [ Leetcode, Python ]
---

Another week, another Leetcode post.

This week is a Leetcode Easy question:

## Problem

Given a string, find the first non-repeating character in it and return its index. If it doesn't exist, return -1.

Example 1:
```
>> s = "leetcode"
0
```

Example 2:
```
>> s = "loveleetcode"
2
```

## Hint

This is a prime example of a problem that can be solved in O(n) by iterating over the string, but even faster by using a hash table.


## Solution 

My solution in python3:

```python
def firstUniqChar(self, s: str) -> int:
    # Optimize for when an empty string is given.
    if not s:
        return -1
    
    # Initialize a Counter object with contents of `s`.
    c = Counter(s)
    
    # Optimize for case when all letters are unique.
    # In that case, the first unique element by definition is the
    # first character.
    if sum(c.values()) == len(c.keys()):
        return 0
    
    # Iterate through the counter.
    # Exploits the fact that Counter is implemented with a dictionary
    # and dicts are ordered as of Python 3.6.
    for key, value in c.items():
        if value == 1:
            return s.index(key)
        
    # No unique characters were found.
    return -1
```

Test cases:
```
"abcd"
"aabc"
"a"
""
"codeleet"
"leetcode"
"loveleetcode"
```

# Analysis

This solution is an example of trading space complexity for runtime gains.

By creating a new dict that may contain up to `n` keys, we trade increased memory footprint for the `O(1)` lookup speed. 

There can be further optimizations made eg. `s.index(key)` call typically takes `O(n)` time to run. However, since we're doing it only once, the tradeoffs are acceptable in this case. 

In fact, this solution beats the Leetcode suggested solution (which also uses a hash table):

`Runtime: 52 ms, faster than 98.21% of Python3 online submissions for First Unique Character in a String.`

`Memory Usage: 14.1 MB, less than 5.54% of Python3 online submissions for First Unique Character in a String.`
