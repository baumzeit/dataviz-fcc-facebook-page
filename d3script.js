window.onload = () => {

    d3.csv('../data/freeCodeCamp-facebook-page-activity.csv')
        .then(data => {
            delete data.columns;
            data.splice(386, 1); // outlier
            data.splice(68, 1); // invalid 'reactions' property
            data.forEach(entry => {
                const [ m, d, y ] = entry.date.split('/');
                const dateString = [ y, m, d ].join('-');
                entry.date = moment(dateString);
                entry.weekday = moment(dateString).isoWeekday();
            });

            // data.filter(entry => entry.date.year(2017))
            visualizeData(data.reverse());
        });

    function visualizeData(data) {
        console.log(data);

        xScale = d3.scaleOrdinal().domain()


        
        const w = 840;
        const h = 240;

        const svg = d3.select('#dataviz')
            .append('svg')
            .attr('id', '#viz-svg')
            .attr('width', w)
            .attr('height', h)

        const statBar = d3.select('#dataviz')
            .append('svg')
            .attr('id', 'statbar')
            .attr('width', w)
            .attr('height', 20)

        
            
        const tooltip = statBar
            .append('text')
            .attr('id', 'tooltip')
            .attr('x', 0)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .style('opacity', 0);

        const barEnter = svg.selectAll('rect')
            .data(data)
            .enter();

        barEnter
            .append('rect')
            .attr('class', 'bar')
            .attr('id', (d, i) => 'bar-' + i)
            .attr('x', (d, i) => i * 2)
            .attr('y', d => h - 100)
            .attr('width', 1)
            .attr('height', h/2)
            .attr('data-title', (d, i) => d.title)

        barEnter
            .append('rect')
            .attr('class', 'bar-box')
            .attr('x', (d, i) => i * 2)
            .attr('y', 0)
            .attr('width', 1)
            .attr('height', h)
            .on('mouseenter', updateSelect)
            .on('mouseout', updateSelect)

        function updateSelect(d, i) {
            const id = '#bar-' + i;
            d3.selectAll('.bar.selected').classed('selected', false)
            d3.select(id).classed('selected', true);
            d3.select('#message-date').html(`${d.date.format('MM/DD/YYYY, ddd')} ${d.time} (US-PDT)`);
            d3.select('#message').html(`"${d.title}"`);

            const dataBar = d3.select(id);
            d3.select('#tooltip')
                .html(dataBar.attr('data-stat'))
                .attr('x', +dataBar.attr('x') + 6)
                .style('opacity', 1)

        }


        const filterKeys = Object.keys(data[0])
            .filter(d => d === 'clicks' || d === 'reach' || d === 'reactions');

        d3.select('#controls').selectAll('button.filter-stats')
            .data(filterKeys)
            .enter()
            .append('button')
            .attr('class', 'filter-stats')
            .attr('id', d => d)
            .on('click', buttonClick)
            .html(d => d);

        function buttonClick(datapoint) {
            const maxValue = d3.max(data, d => +d[datapoint]);
            const heightScale = d3.scaleLinear()
                .domain([ 0, maxValue ])
                .range([ 0, h ]);
            svg.selectAll('.bar')
                .attr('data-stat', d => +d[datapoint] + ' ' + datapoint)
                .transition().delay(100).duration(1000)
                .attr('y', d => h - heightScale(+d[datapoint]))
                .attr('height', d => heightScale(+d[datapoint]))
            const newStat = d3.select('.bar.selected').empty() 
                ? '' 
                : d3.select('.bar.selected').attr('data-stat');
            d3.select('#tooltip').html(newStat);
            d3.selectAll('.filter-stats').classed('active', false);
            d3.select(`.filter-stats#${datapoint}`).classed('active', true);
        }

        d3.select('.filter-stats')
            .dispatch('click')
            .classed('active', true)

        const barBoxes = document.getElementsByClassName('bar-box');
        const randomBox = barBoxes[Math.floor(Math.random() * barBoxes.length)];
        const mouseenterEvent = new Event('mouseenter');
        randomBox.dispatchEvent(mouseenterEvent);
    }

}

