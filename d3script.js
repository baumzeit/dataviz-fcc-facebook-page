window.onload = () => {

    d3.csv('../data/freeCodeCamp-facebook-page-activity.csv')
        .then(data => {
            delete data.columns;
            data.splice(386, 1); // outlier
            data.splice(68, 1); // invalid 'reactions' property
            data.forEach(entry => {
                const [ m, d, y ] = entry.date.split('/');
                const dateString = [ y, m, d ].join('-');
                entry.weekday = moment(dateString).isoWeekday();
                delete entry.date;
                delete entry.time;
            });
            visualizeData(data);
        });

    function visualizeData(data) {
        console.log(data);

        xScale = d3.scaleOrdinal().domain()
        
        const w = 840;
        const h = 240;

        const svg = d3.select('#dataviz')
            .append('svg')
            .attr('width', w)
            .attr('height', h)
            .attr('id', '#viz-svg');

        const barEnter = svg.selectAll('rect')
            .data(data)
            .enter()

        barEnter
            .append('rect')
            .attr('class', 'bar')
            .attr('id', (d, i) => 'bar-' + i)
            .attr('x', (d, i) => i * 2)
            .attr('y', d => h - 100)
            .attr('width', 1)
            .attr('height', 100)
            .attr('data-title', (d, i) => d.title)

        function selector(bool) {
            return function(d, i) {
                const id = '#bar-' + i;
                d3.select(id).classed('selected', bool);
            }
        }
        const selectBar = selector(true);
        const deselectBar = selector(false);

        barEnter
            .append('rect')
            .attr('class', 'bar-box')
            .attr('x', (d, i) => i * 2)
            .attr('y', 0)
            .attr('width', 1)
            .attr('height', h)
            .on('mouseenter', selectBar)
            .on('mouseout', deselectBar)


        const filterKeys = Object.keys(data[0])
            .filter(d => d === 'clicks' || d === 'reach' || d === 'reactions');

        d3.select('#controls').selectAll('button.stats')
            .data(filterKeys)
            .enter()
            .append('button')
            .on('click', buttonClick)
            .html(d => d);

        function buttonClick(datapoint) {
            const maxValue = d3.max(data, d => parseInt(d[datapoint]));
            const heightScale = d3.scaleLinear()
                .domain([ 0, maxValue ])
                .range([ 0, h ]);
            svg.selectAll('.bar').transition().delay(100).duration(1000)
                .attr('y', d => h - heightScale(d[datapoint]))
                .attr('height', d => heightScale(d[datapoint]))
        }


    }

}

